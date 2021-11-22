import { u128, Context } from "near-sdk-as";
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
  requests,
  RequestStatus,
  Room,
  rooms,
  Staker,
  Visibility,
} from "./model";

export function createRoom(_isVisible: boolean): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, RFEE);

  const id = generateId("RM-");
  const room = new Room(
    id,
    Context.sender,
    _isVisible ? Visibility.PUBLIC : Visibility.PRIVATE
  );

  rooms.push(room);
}

export function joinPublicRoom(_roomId: RoomId, _isVisible: boolean): void {
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
          if (members[i].accountId == Context.sender) {
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

export function createGame(_roomId: RoomId, _numOfPlayers: u32): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, GFEE);

  const id = generateId("GM-");
  const game = new Game(_roomId, id);

  games.push(game);
}

export function play(_gameId: GameId): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, PFEE);

  const id = generateId("PL-");

  for (let x = 0; x < games.length; x++) {
    if (games[x].id == _gameId) {
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
