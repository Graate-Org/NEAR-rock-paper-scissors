import { u128, Context, PersistentVector } from "near-sdk-as";
import {
  AccountId,
  GameId,
  GFEE,
  JoinFEE,
  PFEE,
  RFEE,
  RoomId,
  SFEE,
} from "../utils";
import {
  Game,
  games,
  Member,
  Player,
  Request,
  RequestStatus,
  Room,
  rooms,
  Staker,
  Status,
  Visibility,
} from "./model";

export function createRoom(_isVisible: boolean): string {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, RFEE);

  const id = generateId("RM-");
  const room = new Room(
    id,
    Context.sender,
    _isVisible ? Visibility.PUBLIC : Visibility.PRIVATE
  );

  rooms.push(room);
  
  return id;
}

export function joinPublicRoom(_roomId: RoomId, _isVisible: boolean): void {
  verifyRoom(_roomId);

  if (_isVisible) {
    for (let x = 0; x < rooms.length; x++) {
      if (rooms[x].id == _roomId) {
        const room = rooms.swap_remove(x) as Room;
        const members = room.members.get(room.id) as Member[];

        for (let i = 0; i < members.length; i++) {
          if (members[i].accountId == Context.sender) {
            assert(false, "You're already a member of this room");
          }
        }

        room.addNewMember(room.id, Context.sender);
        rooms.push(room);

        break;
      }
    }
  }
}

export function requestToJoinPrivateRoom(_roomId: RoomId): void {
  verifyRoom(_roomId);

  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, JoinFEE);

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      const room = rooms.swap_remove(x) as Room;
      const requests = room.requests.get(_roomId) as Request[];

      for (let i = 0; i < requests.length; i++) {
        assert(
          requests[i].accountId != Context.sender,
          "You already sent a request to this room. Wait for approval"
        );
      }

      room.addNewRequest(_roomId);
      rooms.push(room);

      break;
    }
  }
}

export function approveMember(
  _roomId: RoomId,
  acct: AccountId,
  _isVisible: boolean
): void {
  verifyRoom(_roomId);
  verifyRequest(_roomId, acct);

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      assert(
        Context.sender == rooms[x].owner,
        "You don't have the power to add this fellow"
      );

      break;
    }
  }

  if (!_isVisible) {
    for (let x = 0; x < rooms.length; x++) {
      if (rooms[x].id == _roomId) {
        const room = rooms.swap_remove(x) as Room;
        const members = room.members.get(room.id) as Member[];

        for (let i = 0; i < members.length; i++) {
          if (members[i].accountId == acct) {
            assert(false, "You're already a member of this room");
            break;
          }
        }

        room.addNewMember(room.id, acct);
        room.updateRequests(room.id, acct);
        rooms.push(room);

        break;
      }
    }
  }
}

export function createGame(_roomId: RoomId): void {
  verifyRoom(_roomId);
  verifyMembership(_roomId, Context.sender);
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, GFEE);

  const id = generateId("GM-");
  const game = new Game(_roomId, id);

  games.push(game);
}

export function play(_gameId: GameId): void {
  verifyGame(_gameId);
  
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, PFEE);

  const id = generateId("PL-");

  for (let x = 0; x < games.length; x++) {
    if (games[x].id == _gameId) {
      verifyMembership(games[x].roomId, Context.sender);
      const game = games.swap_remove(x) as Game;
      const players = game.players.get(game.id) as Player[];
      assert(
        players.length + 1 <= game.numOfPlayers,
        "Maximum players reached. Join another game"
      );
      game.addNewPlayer(game.id, id, PFEE);

      games.push(game);
    }
  }
}

export function stake(_gameId: GameId, stakeOn: AccountId): void {
  verifyGame(_gameId);

  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, SFEE);

  const id = generateId("ST-");
  const staker = new Staker(_gameId, stakeOn, SFEE);
  for (let x = 0; x < games.length; x++) {
    if (games[x].id == _gameId) {
      const game = games.swap_remove(x) as Game;

      game.addNewStaker(id, _gameId, stakeOn, SFEE);

      games.push(game);
    }
  }
}

export function payout(_gameId: GameId): void {
  for (let x = 0; x < games.length; x++) {
    if (games[x].id == _gameId) {
      assert(Context.sender == games[x].createdBy, "Only the owner of this game can call this function");

      const game = games.swap_remove(x) as Game;
      if (game.status == Status.COMPLETED) {
        game.rewardWinner(_gameId);
        games.push(game);
      } else {
        assert(false, "This game is not yet completed!");
      }
    }
  }
}

export function getRooms(isJoined: boolean, acct: AccountId): Room[] {
  const returnedRooms: Room[] = [];

  for (let x = 0; x < rooms.length; x++) {
    const members = rooms[x].members.get(rooms[x].id) as Member[];

    for (let i = 0; i < members.length; i++) {
      if(isJoined) {
        if (members[i].accountId == acct) {
          returnedRooms.push(rooms[x]);
        }
      } else if (!isJoined) {
        if (members[i].accountId != acct) {
          returnedRooms.push(rooms[x]);
        }
      }
    }
  }

  return returnedRooms;
}

export function getRoomMembers(_roomId: RoomId): Member[] {
  let returnedMembers: Member[] = [];

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      const members = rooms[x].members.get(rooms[x].id) as Member[];
      returnedMembers = members;

      break;
    }
  }

  return returnedMembers;
}

export function getRoomRequests(_roomId: GameId): Request[] {
  const returnedRequests: Request[] = [];

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      const requests = rooms[x].requests.get(rooms[x].id) as Request[];

      for (let i = 0; i < requests.length; i++) {
        if (requests[i].state != RequestStatus.ACCEPTED) {
          returnedRequests.push(requests[i]);
        }
      }

      break;
    }
  }

  return returnedRequests;
}

export function getRoomGames(_roomId: RoomId): Game[] {
  const roomGames: Game[] = [];

  for (let x = 0; x < games.length; x++) {
    if (games[x].roomId === _roomId) {
      roomGames.push(games[x]);
    }
  }

  return roomGames;
}

export function getRoom(_roomId: RoomId): Room {
  let room: Room = rooms[0];
  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id === _roomId) {
      room = rooms[x];
    }
  }
  return room;
}

export function getProfile(acct: AccountId): Game[] {
  const profile: Game[] = [];
  for (let x = 0; x < games.length; x++) {
    let players = games[x].players.get(games[x].id) as Player[];
    if (players[0].name === acct || players[1].name === acct) {
      profile.push(games[x]);
    }
  }
  return profile;
}

export function getGamePlayers(_gameId: GameId): Player[] {
  let returnedPlayers: Player[] = [];

  for (let x = 0; x < games.length; x++) {
    if (games[x].id == _gameId) {
      const players = games[x].players.get(games[x].id) as Player[];

      returnedPlayers = players;
    }
  }

  return returnedPlayers;
}

export function getGameStakers(_gameId: GameId): Staker[] {
  let returnedStakers: Staker[] = [];

  for (let x = 0; x < games.length; x++) {
    if (games[x].id == _gameId) {
      const players = games[x].stakers.get(games[x].id) as Staker[];

      returnedStakers = players;
    }
  }

  return returnedStakers;
}

export function getWinner(_gameId: GameId): AccountId {
  let returnedWinner: AccountId[] = [];

  for (let x = 0; x < games.length; x++) {
    if (games[x].id == _gameId) {
      const winners = games[x].winners.get(games[x].id) as AccountId[];

      returnedWinner = winners;
    }
  }

  return returnedWinner[0];
}

function verifyMembership(_roomId: RoomId, acct: AccountId): void {
  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id === _roomId) {
      const members = rooms[x].members.get(_roomId) as Member[];

      for (let y = 0; y < members.length; y++) {
        if (members[y].accountId === acct) {
          return;
        }
      }

      break
    }
  }

  assert(false, "You're not a member of this room")
}

function verifyRequest(_roomId: RoomId, acct: AccountId): void {
  for (let x = 0; x < rooms.length; x++) {
    if(rooms[x].id === _roomId) {
      const requests = rooms[x].requests.get(_roomId) as Request[];
      for (let y = 0; y < requests.length; y++) {
        if (requests[y].accountId === acct) {
          return;
        }
      }
      break
    }
  }

  assert(false, "No such request from this user")
}

function verifyRoom(_roomId: RoomId): void {
  for(let x = 0; x < rooms.length; x++) {
    if (rooms[x].id === _roomId) {
      return;
    }
  }

  assert(false, "This room doesn't exist yet");
}

function verifyGame(_gameId: GameId): void {
  for(let x = 0; x < games.length; x++) {
    if (games[x].id === _gameId) {
      return;
    }
  }

  assert(false, "This game doesn't exist yet");
}

function verifyTxFee(deposit: u128, Fee: u128): void {
  assert(
    deposit >= Fee,
    "You need to have at least " +
      Fee.toString() +
      " yocto of NEAR tokens to continue"
  );
}

function generateId(prefix: string): string {
  return prefix + Context.blockTimestamp.toString();
}
