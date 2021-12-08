import { VMContext } from "near-mock-vm";
import { PersistentVector, u128 } from "near-sdk-core";
import {
  approveMember,
  createGame,
  createRoom,
  joinPublicRoom,
  payout,
  play,
  requestToJoinPrivateRoom,
  stake,
} from "../assembly";
import {
  Game,
  games,
  Member,
  Player,
  Request,
  RequestStatus,
  rooms,
  Staker,
  Status,
  Visibility,
} from "../assembly/model";
import { AccountId, GFEE, JoinFEE, PFEE, RFEE, SFEE } from "../utils";

const OWNER: AccountId = "akinyemi.testnet";
const MEMBER: AccountId = "chukwuka.testnet";
const PLAYER: AccountId = "ikeh_akinyemi.testnet";
const STAKER: AccountId = "ikeh_akinyemi.testnet";

describe("Creating a room", () => {
  beforeEach(() => {
    VMContext.setSigner_account_id(OWNER);
    VMContext.setAttached_deposit(RFEE);
  });

  it("creates a new room", () => {
    createRoom(true);
    expect<i32>(rooms.length).toBeGreaterThan(
      0,
      "A new room is expected to be added to the rooms' array"
    );
  });

  it("creates a new private room", () => {
    createRoom(false);
    expect<Visibility>(rooms[0].isVisible).toStrictEqual(
      Visibility.PRIVATE,
      "This new created room should have a visibility of PRIVATE"
    );
  });

  it("throws an error with zero deposit", () => {
    VMContext.setAttached_deposit(u128.Zero);

    function zeroDeposit(): void {
      createRoom(false);
    }
    expect<() => void>(zeroDeposit).toThrow("Expected a deposit before creating a room");
  });
});

describe("Joining a created room", () => {
  beforeEach(() => {
    VMContext.setSigner_account_id(OWNER);
    VMContext.setAttached_deposit(RFEE);
  });

  it("Join a public room", () => {
    createRoom(true);
    VMContext.setSigner_account_id(MEMBER);

    joinPublicRoom(rooms[0].id, true);
    const members = rooms[0].members.get(rooms[0].id) as Member[];

    expect<Member[]>(members).toHaveLength(
      2,
      "A new member has been added to the public room"
    );
  });

  it("Join a private room", () => {
    createRoom(false);
    VMContext.setSigner_account_id(MEMBER);
    VMContext.setAttached_deposit(JoinFEE);

    requestToJoinPrivateRoom(rooms[0].id);
    const requests = rooms[0].requests.get(rooms[0].id) as Request[];
    expect<Request[]>(requests).toHaveLength(1, "A new request to join the private room");

    VMContext.setSigner_account_id(OWNER);
    approveMember(rooms[0].id, requests[0].accountId, false);
    const members = rooms[0].members.get(rooms[0].id) as Member[];

    expect<Member[]>(members).toHaveLength(
      2,
      "A new member has been added to the private room"
    );
    expect<RequestStatus>(requests[0].state).toBe(
      RequestStatus.ACCEPTED,
      "This request has been approved"
    );
  });
});

describe("Creating a game within a room", () => {
  beforeEach(() => {
    VMContext.setSigner_account_id(OWNER);
    VMContext.setAttached_deposit(RFEE);
    createRoom(true);

    VMContext.setSigner_account_id(MEMBER);
    joinPublicRoom(rooms[0].id, true);
  });

  it("Create a game within a room", () => {
    VMContext.setAttached_deposit(GFEE);
    createGame(rooms[0].id);
    expect<PersistentVector<Game>>(games).toHaveLength(
      1,
      "A new game has been created by a member within the room"
    );
  });

  it("throws an error with zero deposit", () => {
    VMContext.setAttached_deposit(u128.Zero);
    function zeroDeposit(): void {
      createGame(rooms[0].id);
    }

    expect<() => void>(zeroDeposit).toThrow("Can't create game with zero deposit");
  });
});

describe("Playing a created game within a room", () => {
  beforeEach(() => {
    VMContext.setSigner_account_id(OWNER);
    VMContext.setAttached_deposit(RFEE);
    createRoom(true);

    VMContext.setSigner_account_id(MEMBER);
    joinPublicRoom(rooms[0].id, true);
    VMContext.setAttached_deposit(GFEE);
    createGame(rooms[0].id);
  });

  it("member gets added as a player and plays", () => {
    VMContext.setAttached_deposit(PFEE);
    play(games[0].id);
    expect<Status>(games[0].status).toBe(Status.ACTIVE, "A player has been added to the game, as well as the player has played and the game is active");

    VMContext.setSigner_account_id(PLAYER);
    joinPublicRoom(rooms[0].id, true);
    VMContext.setAttached_deposit(PFEE);
    play(games[0].id);
    expect<Status>(games[0].status).toBe(Status.COMPLETED, "This game is completed as the last player for the game has played");
  })


  it("throws error with zero deposit", () => {
    VMContext.setAttached_deposit(u128.Zero);
    function zeroDeposit(): void {
      play(games[0].id)
    }
    expect<() => void>(zeroDeposit).toThrow("Can't play a game with zero deposit")
  })

});

describe("Staking on players within a game", () => {
  beforeEach(() => {
    VMContext.setAttached_deposit(RFEE);
    VMContext.setSigner_account_id(OWNER);
    createRoom(true);

    VMContext.setSigner_account_id(MEMBER);
    joinPublicRoom(rooms[0].id, true);
    VMContext.setAttached_deposit(GFEE);
    createGame(rooms[0].id);
    VMContext.setAttached_deposit(PFEE);
    play(games[0].id)
  });

  it("stake on a player", () => {
    VMContext.setAttached_deposit(SFEE);
    VMContext.setSigner_account_id(STAKER);
    const players = games[0].players.get(games[0].id) as Player[];
    stake(games[0].id, MEMBER);
    const stakers = games[0].stakers.get(games[0].id) as Staker[]

    expect<Staker[]>(stakers).toHaveLength(1, "A staker has staked on a player involved in this game")
  })

  it("throws error with zero deposit", () => {
    VMContext.setAttached_deposit(u128.Zero);
    VMContext.setSigner_account_id(STAKER);
    const players = games[0].players.get(games[0].id) as Player[];

    function zeroDeposit(): void {
      stake(games[0].id, MEMBER);
    }
    expect<() => void>(zeroDeposit).toThrow("Can't stake within a game with zero deposit")
  })
})

describe("Winning a game as a player", () => {
  beforeEach(() => {
    VMContext.setAttached_deposit(RFEE);
    VMContext.setSigner_account_id(OWNER);
    createRoom(true);

    VMContext.setSigner_account_id(MEMBER);
    joinPublicRoom(rooms[0].id, true);
    VMContext.setAttached_deposit(GFEE);
    createGame(rooms[0].id);
    VMContext.setAttached_deposit(PFEE);
    play(games[0].id);

    VMContext.setSigner_account_id(PLAYER);
    joinPublicRoom(rooms[0].id, true);
    VMContext.setAttached_deposit(PFEE);
    play(games[0].id);
  });

  it("Winner of the game", () => {
    const winners = games[0].winners.get(games[0].id) as AccountId[];

    expect<string[]>(winners).toHaveLength(1, "We have a winner for the completed game")
  });

  it("Payout of pool", () => {
    expect<void>(payout(games[0].id)).toBeTruthy("Successful transfer transaction to winner and stakers.");
  })
})