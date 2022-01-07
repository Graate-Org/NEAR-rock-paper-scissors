## Rock-Paper-Scissor Game
This repository includes a complete Smart Contract for a rock-paper-scissor game built on the NEAR blockchain. This smart contract has flaws that would fixed in the second version or in a branch within the repo.

The flaws fixed within this smart contract are:
- A player can play twice within a game. 
  - solution: restrict the first player from also being the second player through assertion.
- Anyone can create a game or play a game even if not a member of the room.
  - solution: restrict a non-member from creating or playing a game within a room.
- Without making a request, a player can be added to a private room.
  - solution: check if a join-room request exists before approving a request/member

Check out these additional video content for more informtion on this rock-paper-scissor smart contract methods:
https://loom.com/share/folder/39accbd082e44ddf99805235b2d6f4b1
https://www.loom.com/share/folder/7d02b7d00fdd40d6a77d55d5d60c8363


This is a smart contract written in the simple format. This smart contract introduces game development on the NEAR blockchain using assembly script:
- How to use Data types and the data structures within AssemblyScript based smart contract. How state management across a DApp works, and as well, how to implement restrictions on your smart contracts 
- How to implement random number generation and id checks on the NEAR block chain


## Usage

### Getting started

1. clone this repo to a local folder
2. run `yarn`
3. run `yarn test:unit`

### Top-level `yarn` commands

- run `yarn test` to run all tests
  - (!) be sure to run `yarn build:release` at least once before:
    - run `yarn test:unit` to run only unit tests
- run `yarn build` to quickly verify build status
- run `yarn clean` to clean up build folder

> Check the `./scripts` folder for the integration tests.

### Other documentation

- NEAR-rock-paper-scissor contract and test documentation
  - see `/src/rock-paper-scissor/README` for contract interface
  - see `/src/rock-paper-scissor/__tests__/README` for Sample unit testing details