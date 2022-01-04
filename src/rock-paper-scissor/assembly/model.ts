import {
  Context,
  ContractPromiseBatch,
  PersistentVector,
  PersistentMap,
  u128,
  math,
  logging,
} from "near-sdk-core";
import {
  AccountId,
  GameId,
  PFEE,
  PlayerId,
  RoomId,
  StakerId,
  Timestamp,
} from "../utils";

export enum Choice {
  ROCK,
  PAPER,
  SCISSOR,
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

@nearBindgen
export class Room {
  id: RoomId;
  owner: AccountId;
  isVisible: Visibility;
  members: PersistentMap<RoomId, Member[]>;
  requests: PersistentMap<RoomId, Request[]>;
  createdAt: Timestamp;

  constructor(_id: RoomId, _owner: AccountId, _isVisible: Visibility) {
    this.id = _id;
    this.owner = _owner;
    this.isVisible = _isVisible;

    this.members = new PersistentMap<RoomId, Member[]>("m");
    this.members.set(this.id, [] as Member[]);
    this.addNewMember(this.id, this.owner);

    this.requests = new PersistentMap<RoomId, Request[]>("req");
    this.requests.set(this.id, [] as Request[]);
    this.createdAt = Context.blockTimestamp;
  }

  addNewMember(_roomId: RoomId, acctId: AccountId): void {
    const member = new Member(_roomId, acctId);
    const members = this.members.get(_roomId) as Member[];
    members.push(member);

    this.members.set(_roomId, members);
  }

  addNewRequest(_roomId: RoomId): void {
    const request = new Request(_roomId, Context.sender);
    const requests = this.requests.get(_roomId) as Request[];
    requests.push(request);

    this.requests.set(_roomId, requests);
  }

  acceptRequest(_roomId: RoomId, acctId: AccountId): void {
    const requests = this.requests.get(_roomId) as Request[];

    for (let x = 0; x < requests.length; x++) {
      if (requests[x].accountId == acctId) {
        const request = requests[x];
        request.state = RequestStatus.ACCEPTED;
        this.requests.set(_roomId, requests);
      }
    }
  }

  rejectRequest(_roomId: RoomId, acctId: AccountId): void {
    const requests = this.requests.get(_roomId) as Request[];
    const newRequest: Request[] = [];

    for (let x = 0; x < requests.length; x++) {
      if (requests[x].accountId != acctId) {
        newRequest.push(requests[x]);
      }
    }
    this.requests.set(_roomId, newRequest);
  }
}

@nearBindgen
export class Game {
  id: GameId;
  numOfPlayers: i32;
  players: PersistentMap<GameId, Player[]>;
  stakers: PersistentMap<GameId, Staker[]>;
  createdBy: AccountId;
  createdAt: Timestamp;
  status: Status;
  winners: PersistentMap<GameId, AccountId[]>;
  pool: u128;

  constructor(public roomId: RoomId, _id: GameId) {
    this.id = _id;
    this.numOfPlayers = 2;

    this.players = new PersistentMap<GameId, Player[]>("plys");
    this.players.set(this.id, [] as Player[]);

    this.stakers = new PersistentMap<GameId, Staker[]>("stks");
    this.stakers.set(this.id, [] as Staker[]);

    this.createdBy = Context.sender;
    this.createdAt = Context.blockTimestamp;
    this.status = Status.CREATED;

    this.winners = new PersistentMap<GameId, AccountId[]>("w");
    this.winners.set(this.id, [] as AccountId[]);

    this.pool = u128.Zero;
  }

  addNewPlayer(_gameId: GameId, _playerId: PlayerId, txFee: u128): void {
    function randomNum(): u32 {
      let buf = math.randomBuffer(3);
      return (
        (((0xff & buf[0]) << 1) |
          ((0xff & buf[1]) << 2) |
          ((0xff & buf[2]) << 0)) %
        3
      );
    }
    const randNum = randomNum();

    let choice = Choice.ROCK;

    if (randNum == 1) {
      choice = Choice.PAPER;
    } else if (randNum == 2) {
      choice = Choice.SCISSOR;
    }

    const player = new Player(_playerId, Context.sender, choice, txFee);
    const players = this.players.get(_gameId) as Player[];

    if (players.length === 1 && players[0].name === Context.sender) {
      assert(false, "Player 1 can't be player 2")
    }

    assert(players.length !== 2, "This game is already filled");
    players.push(player);

    this.players.set(_gameId, players);
    this.pool = u128.add(this.pool, txFee);

    const newPlayers = this.players.get(_gameId) as Player[];
    if (newPlayers.length == 1) {
      this.status = Status.ACTIVE;
    } else if (newPlayers.length == this.numOfPlayers) {
      this.winner(_gameId);
    }
  }

  addNewStaker(
    _stakerId: StakerId,
    _gameId: GameId,
    stakeOn: AccountId,
    txFee: u128
  ): void {
    const staker = new Staker(_stakerId, stakeOn, txFee);
    const stakers = this.stakers.get(_gameId) as Staker[];
    stakers.push(staker);

    this.stakers.set(_gameId, stakers);
    this.pool = u128.add(this.pool, txFee);
  }

  winner(_gameId: GameId): void {
    const players = this.players.get(_gameId) as Player[];
    const winners = this.winners.get(_gameId) as AccountId[];

    if (players[0].choice == players[1].choice) {
      winners.push("draw");
      this.winners.set(_gameId, winners);
      return;
    }

    if (players[1].choice == Choice.ROCK && players[0].choice == Choice.PAPER) {
      winners.push(players[0].name);
      this.winners.set(_gameId, winners);
    }
    if (
      players[1].choice === Choice.ROCK &&
      players[0].choice === Choice.SCISSOR
    ) {
      winners.push(players[1].name);
      this.winners.set(_gameId, winners);
    }

    if (
      players[1].choice == Choice.PAPER &&
      players[0].choice == Choice.SCISSOR
    ) {
      winners.push(players[0].name);
      this.winners.set(_gameId, winners);
    }
    if (players[1].choice == Choice.PAPER && players[0].choice == Choice.ROCK) {
      winners.push(players[1].name);
      this.winners.set(_gameId, winners);
    }
    if (
      players[1].choice == Choice.SCISSOR &&
      players[0].choice == Choice.ROCK
    ) {
      winners.push(players[0].name);
      this.winners.set(_gameId, winners);
    }
    if (
      players[1].choice == Choice.SCISSOR &&
      players[0].choice == Choice.PAPER
    ) {
      winners.push(players[1].name);
      this.winners.set(_gameId, winners);
    }
  }

  rewardWinner(_gameId: GameId): void {
    const winners = this.winners.get(this.id) as AccountId[];
    const players = this.players.get(this.id) as Player[];
    const stakers = this.stakers.get(_gameId) as Staker[];

    const reward: u128 = u128.add(u128.mul(PFEE, u128.from(0.5)), PFEE);

    for (let x = 0; x < players.length; x++) {
      if (players[x].name == winners[0]) {
        this.transfer(players[x].name, reward);

        if (stakers.length > -1 || stakers.length > 0) {
          this.rewardStakers(_gameId, players[x].name);
        }

        break;
      }
    }
    
    this.status = Status.COMPLETED;
  }

  rewardStakers(_gameId: GameId, winner: AccountId): void {
    const stakers = this.stakers.get(_gameId) as Staker[];
    const reward: u128 = u128.div(u128.mul(this.pool, u128.from(0.7)), u128.from(stakers.length))

    for (let i = 0; i < stakers.length; i++) {
      if (stakers[i].betOn == winner) {
        this.transfer(stakers[i].name, reward);
      }
    }
  }

  transfer(to: AccountId, reward: u128): void {
    const transfer_win = ContractPromiseBatch.create(to);
    transfer_win.transfer(reward);
  }
}

@nearBindgen
export class Player {
  id: PlayerId;
  name: AccountId;
  choice: Choice;
  timePlayed: u64;
  txFee: u128;

  constructor(_id: PlayerId, _name: AccountId, _choice: Choice, _txFee: u128) {
    this.id = _id;
    this.name = _name;
    this.choice = _choice;
    this.txFee = _txFee;
    this.timePlayed = Context.blockTimestamp;
  }
}

@nearBindgen
export class Staker {
  id: StakerId;
  betOn: AccountId;
  name: AccountId;
  stake: u128;

  constructor(_id: StakerId, _betOn: AccountId, _stake: u128) {
    this.id = _id;
    this.betOn = _betOn;
    this.name = Context.sender;
    this.stake = _stake;
  }
}

@nearBindgen
export class Member {
  roomId: RoomId;
  accountId: AccountId;

  constructor(_roomId: RoomId, _accountId: AccountId) {
    this.roomId = _roomId;
    this.accountId = _accountId;
  }
}

@nearBindgen
export class Request {
  roomId: RoomId;
  accountId: AccountId;
  state: RequestStatus;

  constructor(_roomId: RoomId, _accountId: AccountId) {
    this.roomId = _roomId;
    this.accountId = _accountId;
    this.state = RequestStatus.CREATED;
  }
}

export enum RequestStatus {
  CREATED,
  ACCEPTED,
}

export const rooms = new PersistentVector<Room>("r");
export const games = new PersistentVector<Game>("g");
