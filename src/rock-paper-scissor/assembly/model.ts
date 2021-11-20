import { Context, PersistentVector, RNG, u128 } from "near-sdk-core";
import {
  AccountId,
  GameId,
  PFEE,
  PlayerId,
  RoomId,
  StakeId,
  Timestamp,
} from "../utils";

export enum Choice {
  ROCK,
  PAPER,
  SCISSOR,
}

export enum Participant {
  PLAYER,
  STAKER,
}

export enum Status {
  CREATED,
  ACTIVE,
  COMPLETED,
}

export enum Visibility {
  PUBLIC,
  PRIVATE,
}

// export enum GameType {
//   SOLE,
//   MULTIPLE,
// }

@nearBindgen
export class Room {
  id: RoomId;
  owner: AccountId;
  members: PersistentVector<string>;
  games: PersistentVector<Game>;
  isVisible: Visibility;
  requests: PersistentVector<AccountId>;

  constructor(_id: RoomId, _owner: AccountId, _isVisible: Visibility) {
    this.id = _id;
    this.owner = _owner;
    this.members = new PersistentVector<string>("m");
    this.members.push(_owner);
    this.isVisible = _isVisible;
    this.games = new PersistentVector<Game>("gms");
  }

  addMember(acct: AccountId) {
    assert(
      Context.sender == this.owner,
      "You don't have the power to add this fellow"
    );
    this.members.push(acct);

    let newRequests = new PersistentVector<AccountId>("nqs");
    for (let x = 0; x < this.requests.length; x++) {
      if (this.requests[x] != acct) {
        newRequests.push(this.requests[x]);
      }
    }

    this.requests = newRequests;
  }
}

@nearBindgen
export class Game {
  id: GameId;
  numOfPlayers: u32;
  players: PersistentVector<Player>;
  stakers: PersistentVector<Staker>;
  createdBy: AccountId;
  createdAt: Timestamp;
  status: Status;
  winners: PersistentVector<AccountId>;
  reward: u128;

  constructor(_id: GameId, _numOfPlayers: u32) {
    this.id = _id;
    this.numOfPlayers = _numOfPlayers;

    this.players = new PersistentVector<Player>("plys");
    this.stakers = new PersistentVector<Staker>("stks");
    this.createdBy = Context.sender;
    this.createdAt = Context.blockTimestamp;
    this.status = Status.CREATED;
  }

  addNewPlayer(_playerId: PlayerId, txFee: u128): void {
    assert(
      this.numOfPlayers <= this.players.length,
      "Maximum players reached. Join another game"
    );

    const rand = new RNG<u32>(0, 2);
    const randNum = rand.next();
    let choice = Choice.PAPER;

    if (randNum == 1) {
      choice = Choice.ROCK;
    } else if (randNum == 2) {
      choice = Choice.SCISSOR;
    }

    const player = new Player(_playerId, Context.sender, choice);
    this.players.push(player);
    this.reward = u128.add(this.reward, txFee);

    if (this.players.length == 1) {
      this.status = Status.ACTIVE;
    } else if (this.players.length == this.numOfPlayers) {
      this.status = Status.COMPLETED;
    }
  }

  rewardWinner(): void {
    if (this.numOfPlayers == 3) {
      if (
        (this.players[0].choice == this.players[1].choice &&
          this.players[1].choice == this.players[2].choice &&
          this.players[2].choice == this.players[0].choice) ||
        (this.players[0].choice != this.players[1].choice &&
          this.players[1].choice != this.players[2].choice &&
          this.players[2].choice != this.players[0].choice)
      ) {
        this.winners.push("draw");
      } else {
      }
    } else if (this.numOfPlayers == 2) {
      if (this.players[0].choice == this.players[1].choice) {
        this.winners.push("draw");
      }
    }

    if (
      this.players[1].choice == Choice.ROCK &&
      this.players[0].choice == Choice.PAPER
    ) {
      this.winners.push(this.players[0].name);

      if (this.numOfPlayers == 3 && this.players[2].choice == Choice.PAPER) {
        this.winners.push(this.players[2].name);
      }
    }
    if (
      this.players[1].choice === Choice.ROCK &&
      this.players[0].choice === Choice.SCISSOR
    ) {
      this.winners.push(this.players[1].name);

      if (this.numOfPlayers == 3 && this.players[2].choice == Choice.ROCK) {
        this.winners.push(this.players[2].name);
      }
    }
    if (
      this.players[1].choice == Choice.PAPER &&
      this.players[0].choice == Choice.SCISSOR
    ) {
      this.winners.push(this.players[0].name);

      if (this.numOfPlayers == 3 && this.players[2].choice == Choice.SCISSOR) {
        this.winners.push(this.players[2].name);
      }
    }
    if (
      this.players[1].choice == Choice.PAPER &&
      this.players[0].choice == Choice.ROCK
    ) {
      this.winners.push(this.players[1].name);

      if (this.numOfPlayers == 3 && this.players[2].choice == Choice.PAPER) {
        this.winners.push(this.players[2].name);
      }
    }
    if (
      this.players[1].choice == Choice.SCISSOR &&
      this.players[0].choice == Choice.ROCK
    ) {
      this.winners.push(this.players[0].name);

      if (this.numOfPlayers == 3 && this.players[2].choice == Choice.ROCK) {
        this.winners.push(this.players[2].name);
      }
    }
    if (
      this.players[1].choice == Choice.SCISSOR &&
      this.players[0].choice == Choice.PAPER
    ) {
      this.winners.push(this.players[1].name);

      if (this.numOfPlayers == 3 && this.players[2].choice == Choice.SCISSOR) {
        this.winners.push(this.players[2].name);
      }
    }
  }

  rewardStakers(): void {}
}

@nearBindgen
export class Player {
  id: PlayerId;
  name: AccountId;
  choice: Choice;

  constructor(_id: PlayerId, _name: AccountId, _choice: Choice) {
    this.id = _id;
    this.name = _name;
    this.choice = _choice;
  }

  recordChoice(_choice: Choice) {
    this.choice = _choice;
  }
}

@nearBindgen
export class Staker {
  id: StakeId;
  betOn: AccountId;
  name: AccountId;
  stake: u128;

  constructor(_id: StakeId, _betOn: AccountId, _stake: u128) {
    this.id = _id;
    this.betOn = _betOn;
    this.name = Context.sender;
    this.stake = _stake;
  }
}

export const rooms = new PersistentVector<Room>("r");
export const players = new PersistentVector<Player>("p");
export const stakers = new PersistentVector<Staker>("s");
export const games = new PersistentVector<Game>("g");
