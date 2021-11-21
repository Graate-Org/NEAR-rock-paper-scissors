import {u128, Context, PersistentVector,RNG, math } from "near-sdk-as";
import { AccountId, GameId, GFEE, JoinFEE, PFEE, RFEE, RoomId, SFEE } from "../utils";
import { Game, games, Member, members, Player, Request, requests, RequestStatus, Room, rooms, Staker, Visibility } from "./model";

export function createRoom(_isVisible: boolean): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, RFEE);

  const id = generateId("RM-");
  const room = new Room(id, Context.sender, _isVisible ? Visibility.PUBLIC: Visibility.PRIVATE);

  rooms.push(room);

  const member = new Member(id, Context.sender);
  members.push(member);
}

export function joinPublicRoom(_roomId: RoomId, _isVisible: boolean): void {
  if (_isVisible) {
    for (let i = 0; i < members.length; i++) {
      if(members[i].roomId == _roomId && members[i].accountId == Context.sender) {
        assert(false, "You're already a member of this room");
      }
    }

    const member = new Member(_roomId, Context.sender);
    members.push(member);
  }
}

export function requestToJoinPrivateRoom(_roomId: RoomId): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, JoinFEE);

  for (let i = 0; i < requests.length; i++) {
    if(requests[i].roomId == _roomId && requests[i].accountId == Context.sender) {
      assert(false, "You already sent a request to this room. Wait for approval");
    }
  }

  const request = new Request(_roomId, Context.sender);
  requests.push(request);
}

export function approveMember(_roomId: RoomId, acct: AccountId): void {
    
 for (let x = 0; x < rooms.length; x++) {
   if (rooms[x].id == _roomId) {
    assert(
      Context.sender == rooms[x].owner,
      "You don't have the power to add this fellow"
    );
   }
 }

  for (let i = 0; i < members.length; i++) {
    if(members[i].roomId == _roomId && members[i].accountId == acct) {
      assert(false, "You're already a member of this room");
    }
  }

  const member = new Member(_roomId, acct);
  members.push(member);

  for (let x = 0; x < requests.length; x++) {
    if (requests[x].accountId == acct) {
     const request = requests[x];
     request.state = RequestStatus.ACCEPTED;
     requests.replace(x, request);
    }
  }
}

export function createGame(_roomId: RoomId, _numOfPlayers: u32): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, GFEE);

  const id = generateId("GM-");
  const game = new Game(_roomId, id, _numOfPlayers);

  games.push(game); 
}

export function play(_gameId: GameId): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, PFEE);

  const id = generateId("PL-");

  for (let x = 0; x < games.length; x++) {
    if (games[x].id == _gameId) {
      const game = games.swap_remove(x) as Game;
      const players = game.players.get(game.id) as Player[]
      assert(
        players.length <= game.numOfPlayers,
        "Maximum players reached. Join another game"
      );
      game.addNewPlayer(game.id, id, PFEE);

      games.push(game);
    }
  }
}

// export function stake(_roomId: RoomId, _gameId: GameId, stakeOn: AccountId): void {
//   const txDeposit = Context.attachedDeposit;
//   verifyTxFee(txDeposit, SFEE);

//   const id = generateId("ST-");
//   const staker = new Staker(id, stakeOn, txDeposit);

//   for (let x = 0; x < rooms.length; x++) {
//     if (rooms[x].id == _roomId) {
//       for (let y = 0; y < rooms[x].games.length; y++) {
//         if (rooms[x].games[y].id == _gameId) {
//           rooms[x].games[y].stakers.push(staker)
//         }
//       }
//     }
//   }
// }

function verifyTxFee(deposit: u128, Fee: u128): void {
  assert(deposit >= Fee, "You need to have at least " + Fee.toString() + " yocto of NEAR tokens to continue");
}

function generateId(prefix: string): string {
  return prefix + Context.blockTimestamp.toString();
}

// function addMember(room: Room, acct: AccountId): Room {
//   assert(
//     Context.sender == room.owner,
//     "You don't have the power to add this fellow"
//   );
//   let newMembers = new PersistentVector<AccountId>("m")

//   for (let i = 0; i < room.members.length; i++) {
//     newMembers.push(room.members[i]);
//   }

//   room.members = newMembers;

//   let newRequests = new PersistentVector<AccountId>("nqs");
//   for (let x = 0; x < room.requests.length; x++) {
//     if (room.requests[x] != acct) {
//       newRequests.push(room.requests[x]);
//     }
//   }

//   room.requests = newRequests;

//   return room;
// }

export function randomNum(): u32 {
  let buf = math.randomBuffer(3);
  return (
    (((0xff & buf[0]) << 1) |
      ((0xff & buf[1]) << 2) |
      ((0xff & buf[2]) << 0)) %
    3
  );
}