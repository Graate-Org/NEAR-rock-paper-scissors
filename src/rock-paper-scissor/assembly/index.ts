import {storage, Context } from "near-sdk-as";

function test(name: string): void {
  storage.set(Context.blockTimestamp.toString(), name);
}