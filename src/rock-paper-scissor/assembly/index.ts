import {u128, Context } from "near-sdk-as";
import { GFEE, RFEE, RoomId } from "../utils";
import { Game, Room, rooms, Visibility } from "./model";

export function createRoom(_isVisible: Visibility): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, RFEE);

  const id = generateId();
  const room = new Room(id, Context.sender, _isVisible ? Visibility.PUBLIC: Visibility.PRIVATE);

  rooms.push(room);
}

export function createGame(_roomId: RoomId): void {
  const txDeposit = Context.attachedDeposit;
  verifyTxFee(txDeposit, GFEE);

  const id = generateId();
  const game = new Game()
}

export function play(): void {

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