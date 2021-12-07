import { VMContext } from "near-mock-vm";
import { u128 } from "near-sdk-core";
import {
  approveMember,
  createGame,
  createRoom,
  joinPublicRoom,
  play,
  requestToJoinPrivateRoom,
} from "../assembly";
import {
  games,
  Member,
  Request,
  RequestStatus,
  rooms,
  Status,
  Visibility,
} from "../assembly/model";
import { AccountId, GFEE, JoinFEE, PFEE, RFEE } from "../utils";

const OWNER: AccountId = "akinyemi.testnet";
const MEMBER: AccountId = "chukwuka.testnet";
const PLAYER: AccountId = "ikeh_akinyemi.testnet";

describe("Creating a room", () => {
  beforeEach(() => {
    VMContext.setSigner_account_id(OWNER);
    VMContext.setAttached_deposit(RFEE);
  });

  it("creates a new room", () => {
    createRoom(true);
    expect(rooms.length).toBeGreaterThan(
      0,
      "A new room is expected to be added to the rooms' array"
    );
  });

  it("creates a new private room", () => {
    createRoom(false);
    expect(rooms[0].isVisible).toStrictEqual(
      Visibility.PRIVATE,
      "This new created room should have a visibility of PRIVATE"
    );
  });

  it("throws an error with zero deposit", () => {
    VMContext.setAttached_deposit(u128.Zero);

    function zeroDeposit(): void {
      createRoom(false);
    }
    expect(zeroDeposit).toThrow("Expected a deposit before creating a room");
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

    expect(members).toHaveLength(
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
    expect(requests).toHaveLength(1, "A new request to join the private room");

    VMContext.setSigner_account_id(OWNER);
    approveMember(rooms[0].id, requests[0].accountId, false);
    const members = rooms[0].members.get(rooms[0].id) as Member[];

    expect(members).toHaveLength(
      2,
      "A new member has been added to the private room"
    );
    expect(requests[0].state).toBe(
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
    expect(games).toHaveLength(
      1,
      "A new game has been created by a member within the room"
    );
  });

  it("throws an error with zero deposit", () => {
    VMContext.setAttached_deposit(u128.Zero);
    function zeroDeposit(): void {
      createGame(rooms[0].id);
    }

    expect(zeroDeposit).toThrow("Can't create game with zero deposit");
  });
});

describe("Playing a created game within a room", () => {
  beforeEach(() => {
    VMContext.setSigner_account_id(OWNER);
    VMContext.setAttached_deposit(GFEE);
    createRoom(true);

    VMContext.setSigner_account_id(MEMBER);
    joinPublicRoom(rooms[0].id, true);
    VMContext.setAttached_deposit(GFEE);
    createGame(rooms[0].id);
  });

  it("member get added as a player and plays", () => {
    VMContext.setAttached_deposit(PFEE);
    play(games[0].id);
    expect(games[0].status).toBe(Status.ACTIVE, "A player has been added to the game, as well as the player has played and the game is active");
  })
  
})