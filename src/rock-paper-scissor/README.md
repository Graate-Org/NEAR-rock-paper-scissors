![Near, Inc. logo](https://near.org/wp-content/themes/near-19/assets/img/logo.svg?t=1553011311)

## Design

### Interface

#### Core functions

```ts
function createRoom
```
- "Change" function (ie. a function that alters contract state)
- Recieve a boolean value (false for private room, true for public room)
- Creates a new room and update the rooms data structure with the created room.
- Returns a success message.

```ts
function joinPublicRoom
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_roomId": RoomId, "_isVisible": boolean}'` parameters
- Allows the account initiating the contract call to join the room that's public
- This invokes a `addNewMember` method on the `Room` data type.
- Returns a success message.

```ts
function requestToJoinPrivateRoom
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_roomId": RoomId}'` as parameter
- Allows the account initiating the contract call to request to join a private room
- This invokes a `addNewRequest` method on the `Room` data type.
- Returns a success message.

```ts
function responseToRequest
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_roomId": RoomId, "acct": AccountId, "acceptance": boolean}'` as parameter
- This invokes the `addNewMember` and the `acceptRequests` methods on the `Room` data type if `acceptance` is `true` while it invoking the `rejectRequest` method if `acceptance` is `false`.
- Returns a success message.

```ts
function createGame
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_roomId": RoomId}'` as parameter
- Allows the account initiating the contract call to create a new game within a room
- This updates the `games` data structure with the new game.
- Returns a success message.


```ts
function play
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_gameId": GameId}'` as parameter
- This invokes the `addNewPlayer` method on the `Game` data type.
- Smart contract panics if maximum players reached.
- Returns a success message.


```ts
function stake
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{_gameId: GameId, stakeOn: AccountId}'` as parameter
- This invokes the `addNewStaker` method on the `Game` data type.
- Returns a success message.

```ts
function payout
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_gameId": GameId}'` as parameter
- Smart contract panics if game is still active.
- Returns boolean

#### Game Reporting Functions

```ts
function getRooms
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{"isJoined": boolean}'` as parameter
- Returns rooms that a player is a member ofor rooms a player is not a member of depending on the parameter passed.

```ts
function getRoomMembers
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{"_roomId": RoomId}'` as parameter
- Returns an array of members of a room.

```ts
function getRoomRequests
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{"_roomId": RoomId}'` as parameter
- Returns an array of requests within a private room.

```ts
function getRoomGames
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{"_roomId": RoomId, "gameStatus": Status}'` as parameter
- Returns an array of games within the room; either created or active or completed games.

```ts
function getRoom
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{_roomId: RoomId}'` as parameter
- Returns a room with its details.

```ts
function getGame
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{_gameId: GameId}'` as parameter
- Returns a game with its details.

```ts
function getProfile
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{acct: AccountId}'` as parameter
- Returns a all the rooms that an accountId is a member of.

```ts
function getGamePlayers
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{"_gameId": GameId}'` as parameter
- Returns an array of players participating in a game.

```ts
function getGameStakers
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{"_gameId": GameId}'` as parameter
- Returns an array of stakers participating in a game.

```ts
function getWinner
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{"_gameId": GameId}'` as parameter
- Returns an array of winners for a game.

### Helper Functions

```ts
function verifyMembership
```
- Non-exported function (ie. a function that can be acessed outside the contract)
- Recieves a `'{_roomId: RoomId, acct: AccountId}'` as parameter
- Verifies that an AccountId is a member of a room.

```ts
function verifyRequest
```
- Non-exported function (ie. a function that can be acessed outside the contract)
- Recieves a `'{_roomId: RoomId, acct: AccountId}'` as parameter
- Verifies that a request tied to an AccountId exists within a room's requests.

```ts
function verifyRoom
```
- Non-exported function (ie. a function that can be acessed outside the contract)
- Recieves a `'{_roomId: RoomId}'` as parameter
- Verifies that a room exists within the rooms array.

```ts
function verifyGame
```
- Non-exported function (ie. a function that can be acessed outside the contract)
- Recieves a `'{_gameId: GameId}'` as parameter
- Verifies that a game exist within the games array.

```ts
function verifyTxFee
```
- Non-exported function (ie. a function that can be acessed outside the contract)
- Recieves a `'{deposit: u128, Fee: u128}'` as parameter
- Verifies that a particular deposit was made to the smart contract.

```ts
function generateId
```
- Non-exported function (ie. a function that can be acessed outside the contract)
- Recieves a `'{prefix: string}'` as parameter
- Generates and returns a unique ID