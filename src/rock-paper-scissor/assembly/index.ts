import {u128, Context } from "near-sdk-as";
import { AccountId, GameId, GFEE, JoinFEE, PFEE, RFEE, RoomId } from "../utils";
import { Choice, Game, Room, rooms, Visibility } from "./model";

export function createRoom(_isVisible: boolean): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, RFEE);

  const id = generateId();
  const room = new Room(id, Context.sender, _isVisible ? Visibility.PUBLIC: Visibility.PRIVATE);

  rooms.push(room);
}

export function joinRoom(_roomId: RoomId, _isVisible: boolean): void {
  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId && _isVisible == true) {
      rooms[x].members.push(Context.sender);
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

export function approveMember(_roomId: RoomId, acct: AccountId) {
  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      rooms[x].addMember(acct);
    }
  }
}

export function createGame(_roomId: RoomId, _numOfPlayers: u32): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, GFEE);

  const id = generateId();
  const game = new Game(id, _numOfPlayers);

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      rooms[x].games.push(game);
    }
  }
}

export function play(_roomId: RoomId, _gameId: GameId, _choice: Choice): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, PFEE);

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      for (let y = 0; y < rooms[x].games.length; y++) {
        if (rooms[x].games[y].id == _gameId) {
          rooms[x].games[y].addNewPlayer(Context.sender);
        }
      }
    }
  }
}

export function stake(_roomId: RoomId, _gameId: GameId, ): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, GFEE);

  for (let x = 0; x < rooms.length; x++) {
    if (rooms[x].id == _roomId) {
      for (let y = 0; y < rooms[x].games.length; y++) {
        if (rooms[x].games[y].id == _gameId) {
          rooms[x].games[y].addNewPlayer(Context.sender);
        }
      }
    }
  }
}

/**
 * generates a random ID 
 * @returns string
 */
function generateId(): string {
  return Context.blockTimestamp.toString();
}

/**
 * A helper function to verify the NEAR provided is greater or equal to [Fee] NEAR
 * @param deposit 
 */
 function verifyTxFee(deposit: u128, Fee: u128): void {
  assert(deposit >= Fee, "You need to have at least " + Fee + " yocto of NEAR tokens to continue");
}