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

 [Success]: ✔ create a public room
 [Success]: ✔ Accept request to join private room
 [Success]: ✔ Reject request to join private room

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
 [Summary]: 14 pass,  0 fail, 14 total
    [Time]: 169.011ms

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  [Result]: ✔ PASS
   [Files]: 1 total
  [Groups]: 7 count, 7 pass
   [Tests]: 14 pass, 0 fail, 14 total
    [Time]: 9047.68ms
✨  Done in 9.90s.