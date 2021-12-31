import { u128, Context, logging } from "near-sdk-as";
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
  return "Created a room with id: " + id;
}

export function joinPublicRoom(_roomId: RoomId, _isVisible: boolean): string {
  verifyRoom(_roomId);

  if (_isVisible) {
    for (let x = 0; x < rooms.length; x++) {
      if (rooms[x].id == _roomId) {
        const room = rooms.swap_remove(x) as Room;
        const members = room.members.get(room.id) as Member[];

        for (let i = 0; i < members.length; i++) {
          if (members[i].accountId == Context.sender) {
            assert(
              false,
              "You're already" +
                members[i].accountId +
                " " +
                Context.sender +
                " a member of this room"
            );
          }
        }

        room.addNewMember(room.id, Context.sender);
        rooms.push(room);
      }
    }
  }
  return "Successfully joined room";
}

export function requestToJoinPrivateRoom(_roomId: RoomId): string {
  verifyRoom(_roomId);

  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, JoinFEE);

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      const room = rooms.swap_remove(x) as Room;
      const requests = room.requests.get(_roomId) as Request[];

      for (let i = 0; i < requests.length; i++) {
        logging.log(requests[i].accountId);
        assert(
          requests[i].accountId != Context.sender,
          "You already sent a request to this room. Wait for approval " + requests[i].accountId + " " + Context.sender
        );
      }

      room.addNewRequest(_roomId);
      rooms.push(room);
    }
  }

  return "Request sent successfully!";
}

export function responseToRequest(
  _roomId: RoomId,
  acct: AccountId,
  acceptance: boolean
): string {
  verifyRoom(_roomId);
  verifyRequest(_roomId, acct);

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      assert(
        Context.sender == rooms[x].owner,
        "You don't have the power to add this fellow"
      );
    }
  }

    for (let x = 0; x < rooms.length; x++) {
      if (rooms[x].id == _roomId) {
        const room = rooms.swap_remove(x) as Room;
        const members = room.members.get(room.id) as Member[];

        for (let i = 0; i < members.length; i++) {
          if (members[i].accountId == acct) {
            assert(false, "You're already a member of this room");
          }
        }

        if (acceptance) {
          room.addNewMember(room.id, acct);
          room.acceptRequest(room.id, acct);
        } else {
          room.rejectRequest(room.id, acct);
        } 

        rooms.push(room);
      }
    }
  

  return "Successfully decided on the new member's request";
}

export function createGame(_roomId: RoomId): string {
  verifyRoom(_roomId);
  verifyMembership(_roomId, Context.sender);
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, GFEE);

  const id = generateId("GM-");
  const game = new Game(_roomId, id);

  games.push(game);

  return "Created a game with id: " + id;
}

export function play(_gameId: GameId): string {
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
        players.length <= game.numOfPlayers,
        "Maximum players reached. Join another game"
      );
      game.addNewPlayer(game.id, id, PFEE);

      games.push(game);
    }
  }

  return "Your hand-gesture has been registered";
}

export function stake(_gameId: GameId, stakeOn: AccountId): string {
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

  return "You have staked on this player: " + stakeOn;
}

export function payout(_gameId: GameId): bool {
  let isPaid: bool = false;

  for (let x = 0; x < games.length; x++) {
    if (games[x].id == _gameId) {
      const game = games.swap_remove(x) as Game;
      const players = game.players.get(_gameId) as Player[];
      if (players.length == game.numOfPlayers) {
        game.rewardWinner(_gameId);
        games.push(game);
        isPaid = true;
        return isPaid;
      } else {
        assert(false, "This game is not yet completed!");
      }
    }
  }

  return isPaid;
}

export function getRooms(isJoined: boolean, acct: AccountId): Room[] {
  const returnedRooms: Room[] = [];

  for (let x = 0; x < rooms.length; x++) {
    const members = rooms[x].members.get(rooms[x].id) as Member[];

    if (isJoined) {
      for (let i = 0; i < members.length; i++) {
        if (members[i].accountId == acct) {
          returnedRooms.push(rooms[x]);
          break;
        }
      }
    }

    if (!isJoined) {
      const arr = [];
      for (let i = 0; i < members.length; i++) {
        if (members[i].accountId == acct) {
          arr.push(true);
        } else {
          arr.push(false);
        }
      }

      if (arr.includes(true) == false) {
        returnedRooms.push(rooms[x]);
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
    }
  }

  return returnedRequests;
}

export function getRoomGames(_roomId: RoomId): Game[] {
  const roomGames: Game[] = [];

  for (let x = 0; x < games.length; x++) {
    if (games[x].roomId == _roomId) {
      roomGames.push(games[x]);
    }
  }

  return roomGames;
}

export function getRoom(_roomId: RoomId): Room[] {
  let room: Room[] = [];

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      room.push(rooms[x]);
    }
  }

  return room;
}

export function getProfile(acct: AccountId): Room[] {
  const profile = [] as Room[];

  for (let x = 0; x < rooms.length; x++) {
    let members = rooms[x].members.get(rooms[x].id) as Member[];
    
    for (let y = 0; y < members.length; y++) {
      if (members[y].accountId == acct) {
        profile.push(rooms[x]);
        break;
      }
    }
  }

  return profile;
}

export function getGame(_gameId: GameId): Game[] {
  let game: Game[] = [];

  for (let x = 0; x < games.length; x++) {
    if (games[x].id == _gameId) {
      game.push(games[x]);
    }
  }

  return game;
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
    if (rooms[x].id == _roomId) {
      const members = rooms[x].members.get(_roomId) as Member[];

      for (let y = 0; y < members.length; y++) {
        if (members[y].accountId == acct) {
          return;
        }
      }
    }
  }

  assert(false, "You're not a member of this room");
}

function verifyRequest(_roomId: RoomId, acct: AccountId): void {
  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      const requests = rooms[x].requests.get(_roomId) as Request[];
      for (let y = 0; y < requests.length; y++) {
        if (requests[y].accountId == acct) {
          return;
        }
      }
    }
  }

  assert(false, "No such request from this user");
}

function verifyRoom(_roomId: RoomId): void {
  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      return;
    }
  }

  assert(false, "This room doesn't exist yet");
}

function verifyGame(_gameId: GameId): void {
  for (let x = 0; x < games.length; x++) {
    if (games[x].id == _gameId) {
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
