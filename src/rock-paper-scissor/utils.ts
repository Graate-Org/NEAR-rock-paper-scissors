import { u128 } from "near-sdk-core";

export type Timestamp = u64;

export type AccountId = string;

export type RoomId = string;

export type GameId = string;

export type PlayerId = string;

export type StakerId = string;

export const SFEE = u128.from("1000000000000000000000000");
export const RFEE = u128.from("700000000000000000000000");
export const GFEE = u128.from("500000000000000000000000");
export const PFEE = u128.from("200000000000000000000000");
export const JoinFEE = u128.from("100000000000000000000000");