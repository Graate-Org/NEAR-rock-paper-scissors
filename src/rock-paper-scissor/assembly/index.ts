import {u128, Context, PersistentVector } from "near-sdk-as";
import { AccountId, GameId, GFEE, JoinFEE, PFEE, RFEE, RoomId, SFEE } from "../utils";
import { Game, Room, rooms, Staker, Visibility } from "./model";

export function createRoom(_isVisible: boolean): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, RFEE);

  const id = generateId("RM-");
  const room = new Room(id, Context.sender, _isVisible ? Visibility.PUBLIC: Visibility.PRIVATE);

  rooms.push(room);
}

export function joinRoom(_roomId: RoomId, _isVisible: boolean): void {
  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId && _isVisible == true) {
      rooms[x] = addMember(rooms[x], Context.sender);
     }
  }
}

export function requestToJoinRoom(_roomId: RoomId, _isVisible: boolean): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, JoinFEE);

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId && _isVisible == true) {
      rooms[x].requests.push(Context.sender);
    }
  }
}

export function approveMember(_roomId: RoomId, acct: AccountId): void {
  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      rooms[x] = addMember(rooms[x], acct);
    }
  }
}

export function createGame(_roomId: RoomId, _numOfPlayers: u32): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, GFEE);

  const id = generateId("GM-");
  const game = new Game(id, _numOfPlayers);

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      rooms[x].games.push(game);
    }
  }
}

export function play(_roomId: RoomId, _gameId: GameId): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, PFEE);

  const id = generateId("PL-");

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      for (let y = 0; y < rooms[x].games.length; y++) {
        if (rooms[x].games[y].id == _gameId) {
          rooms[x].games[y].addNewPlayer(id, PFEE);
        }
      }
    }
  }
}

export function stake(_roomId: RoomId, _gameId: GameId, stakeOn: AccountId): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, SFEE);

  const id = generateId("ST-");
  const staker = new Staker(id, stakeOn, txDeposit);

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      for (let y = 0; y < rooms[x].games.length; y++) {
        if (rooms[x].games[y].id == _gameId) {
          rooms[x].games[y].stakers.push(staker)
        }
      }
    }
  }
}

/**
 * generates a random ID 
 * @returns string
 */
function generateId(prefix: string): string {
  return prefix + Context.blockTimestamp.toString();
}

/**
 * A helper function to verify the NEAR provided is greater or equal to [Fee] NEAR
 * @param deposit 
 */
 function verifyTxFee(deposit: u128, Fee: u128): void {
  assert(deposit >= Fee, "You need to have at least " + Fee.toString() + " yocto of NEAR tokens to continue");
}

function addMember(room: Room, acct: AccountId): Room {
  assert(
    Context.sender == room.owner,
    "You don't have the power to add this fellow"
  );
  let newMembers = new PersistentVector<AccountId>("m")

  for (let i = 0; i < room.members.length; i++) {
    newMembers.push(room.members[i]);
  }

  room.members = newMembers;

  let newRequests = new PersistentVector<AccountId>("nqs");
  for (let x = 0; x < room.requests.length; x++) {
    if (room.requests[x] != acct) {
      newRequests.push(room.requests[x]);
    }
  }

  room.requests = newRequests;

  return room;
}