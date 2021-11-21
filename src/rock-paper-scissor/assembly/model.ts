import {
  Context,
  ContractPromiseBatch,
  PersistentVector,
  RNG,
  u128,
} from "near-sdk-core";
import {
  AccountId,
  GameId,
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
  isVisible: Visibility;
  requests: PersistentVector<AccountId>;

  constructor(_id: RoomId, _owner: AccountId, _isVisible: Visibility) {
    this.id = _id;
    this.owner = _owner;
    this.isVisible = _isVisible;
    this.requests = new PersistentVector<AccountId>("req")
  }
}

@nearBindgen
export class Game {
  id: GameId;
  numOfPlayers: i32;
  players: PersistentVector<Player>;
  stakers: PersistentVector<Staker>;
  createdBy: AccountId;
  createdAt: Timestamp;
  status: Status;
  winners: PersistentVector<AccountId>;
  pool: u128;

  constructor(_id: GameId, _numOfPlayers: u32) {
    this.id = _id;
    this.numOfPlayers = _numOfPlayers;

    this.players = new PersistentVector<Player>("plys");
    this.stakers = new PersistentVector<Staker>("stks");
    this.createdBy = Context.sender;
    this.createdAt = Context.blockTimestamp;
    this.status = Status.CREATED;
    this.winners = new PersistentVector<AccountId>("w");
    this.pool = u128.Zero;
  }

  addNewPlayer(_playerId: PlayerId, txFee: u128): void {
    assert(
      this.players.length <= this.numOfPlayers,
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

    const player = new Player(_playerId, Context.sender, choice, txFee);
    this.players.push(player);
    this.pool = u128.add(this.pool, txFee);

    if (this.players.length == 1) {
      this.status = Status.ACTIVE;
    } else if (this.players.length == this.numOfPlayers) {
      this.status = Status.COMPLETED;
      this.rewardWinner();
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
      this.transfer(this.players[0].name, this.players[0].txFee);
      this.rewardStakers(this.players[0].name);

      if (this.numOfPlayers == 3 && this.players[2].choice == Choice.PAPER) {
        this.winners.push(this.players[2].name);
        this.transfer(this.players[2].name, this.players[2].txFee);
        this.rewardStakers(this.players[2].name);
      }
    }
    if (
      this.players[1].choice === Choice.ROCK &&
      this.players[0].choice === Choice.SCISSOR
    ) {
      this.winners.push(this.players[1].name);
      this.transfer(this.players[1].name, this.players[1].txFee);
      this.rewardStakers(this.players[1].name);

      if (this.numOfPlayers == 3 && this.players[2].choice == Choice.ROCK) {
        this.winners.push(this.players[2].name);
        this.transfer(this.players[2].name, this.players[2].txFee);
        this.rewardStakers(this.players[2].name);
      }
    }
    if (
      this.players[1].choice == Choice.PAPER &&
      this.players[0].choice == Choice.SCISSOR
    ) {
      this.winners.push(this.players[0].name);
      this.transfer(this.players[0].name, this.players[0].txFee);
      this.rewardStakers(this.players[0].name);

      if (this.numOfPlayers == 3 && this.players[2].choice == Choice.SCISSOR) {
        this.winners.push(this.players[2].name);
        this.transfer(this.players[2].name, this.players[2].txFee);
        this.rewardStakers(this.players[2].name);
      }
    }
    if (
      this.players[1].choice == Choice.PAPER &&
      this.players[0].choice == Choice.ROCK
    ) {
      this.winners.push(this.players[1].name);
      this.transfer(this.players[1].name, this.players[1].txFee);
      this.rewardStakers(this.players[1].name);

      if (this.numOfPlayers == 3 && this.players[2].choice == Choice.PAPER) {
        this.winners.push(this.players[2].name);
        this.transfer(this.players[2].name, this.players[2].txFee);
        this.rewardStakers(this.players[2].name);
      }
    }
    if (
      this.players[1].choice == Choice.SCISSOR &&
      this.players[0].choice == Choice.ROCK
    ) {
      this.winners.push(this.players[0].name);
      this.transfer(this.players[0].name, this.players[0].txFee);
      this.rewardStakers(this.players[0].name);

      if (this.numOfPlayers == 3 && this.players[2].choice == Choice.ROCK) {
        this.winners.push(this.players[2].name);
        this.transfer(this.players[2].name, this.players[2].txFee);
        this.rewardStakers(this.players[2].name);
      }
    }
    if (
      this.players[1].choice == Choice.SCISSOR &&
      this.players[0].choice == Choice.PAPER
    ) {
      this.winners.push(this.players[1].name);
      this.transfer(this.players[1].name, this.players[1].txFee);
      this.rewardStakers(this.players[1].name);

      if (this.numOfPlayers == 3 && this.players[2].choice == Choice.SCISSOR) {
        this.winners.push(this.players[2].name);
        this.transfer(this.players[2].name, this.players[2].txFee);
        this.rewardStakers(this.players[2].name);
      }
    }
  }

  rewardStakers(_betOn: AccountId): void {
    for(let i = 0; i < this.stakers.length; i++) {
      if (this.stakers[i].betOn == _betOn) {
        this.transfer(this.stakers[i].name, this.stakers[i].stake);
      }
    }
  }

  transfer(to: AccountId, invested: u128): void {
    const reward = u128.add(invested, u128.mul(invested, u128.from(0.5)));

    const transfer_win = ContractPromiseBatch.create(to);
    transfer_win.transfer(reward);
  }
}

@nearBindgen
export class Player {
  id: PlayerId;
  name: AccountId;
  choice: Choice;
  txFee: u128;

  constructor(_id: PlayerId, _name: AccountId, _choice: Choice, _txFee: u128) {
    this.id = _id;
    this.name = _name;
    this.choice = _choice;
    this.txFee = _txFee;
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

export class Member {
  roomId: RoomId;
  accountId: AccountId;

  constructor(_roomId: RoomId, _accountId: AccountId) {
    this.roomId = _roomId;
    this.accountId = _accountId;
  }
}

export class Request {
  roomId: RoomId;
  accountId: AccountId;
  state: 'Created' | 'Rejected' | 'Accepted';

  constructor(_roomId: RoomId, _accountId: AccountId) {
    this.roomId = _roomId;
    this.accountId = _accountId;
    this.state = "Created";
  }
}

export const rooms = new PersistentVector<Room>("r");
export const players = new PersistentVector<Player>("p");
export const stakers = new PersistentVector<Staker>("s");
export const games = new PersistentVector<Game>("g");
export const members = new PersistentVector<Member>("m");
export const requests = new PersistentVector<Request>("m");

