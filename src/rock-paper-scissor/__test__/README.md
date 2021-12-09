## Unit tests

Unit tests can be run from the top level folder using the following command:

```
yarn test:unit
```

### Tests for Contract in `index.unit.spec.ts`


```
[Describe]: Creating a room

 [Success]: ✔ creates a new room
 [Success]: ✔ creates a new private room
 [Success]: ✔ throws an error with zero deposit

[Describe]: Joining a created room

 [Success]: ✔ Join a public room
 [Success]: ✔ Join a private room

[Describe]: Creating a game within a room

 [Success]: ✔ Create a game within a room
 [Success]: ✔ throws an error with zero deposit

[Describe]: Playing a created game within a room

 [Success]: ✔ member gets added as a player and plays
 [Success]: ✔ throws error with zero deposit

[Describe]: Staking on players within a game

 [Success]: ✔ stake on a player
 [Success]: ✔ throws error with zero deposit

[Describe]: Winning a game as a player

 [Success]: ✔ Winner of the game
 [Success]: ✔ Payout of pool

    [File]: src/rock-paper-scissor/__test__/index.unit.spec.ts
  [Groups]: 7 pass, 7 total
  [Result]: ✔ PASS
[Snapshot]: 0 total, 0 added, 0 removed, 0 different
 [Summary]: 13 pass,  0 fail, 13 total
    [Time]: 167.882ms

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  [Result]: ✔ PASS
   [Files]: 1 total
  [Groups]: 7 count, 7 pass
   [Tests]: 13 pass, 0 fail, 13 total
    [Time]: 8698.37ms
✨  Done in 17.96s.