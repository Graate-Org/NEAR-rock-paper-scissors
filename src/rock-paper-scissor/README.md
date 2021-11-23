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

```ts
function joinPublicRoom
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_roomId": RoomId, "_isVisible": boolean}'` parameters
- Allows the account initiating the contract call to join the room that's public
- This invokes a `addNewMember` method on the `Room` data type.

```ts
function requestToJoinPrivateRoom
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_roomId": RoomId}'` as parameter
- Allows the account initiating the contract call to request to join a private room
- This invokes a `addNewRequest` method on the `Room` data type.

```ts
function approveMember
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_roomId": RoomId, "acct": AccountId, "_isVisible": boolean}'` as parameter
- This invokes the `addNewMember` and the `updateRequests` methods on the `Room` data type.

```ts
function createGame
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_roomId": RoomId}'` as parameter
- Allows the account initiating the contract call to create a new game within a room
- This updates the `games` data structure with the new game.


```ts
function play
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_gameId": GameId}'` as parameter
- This invokes the `addNewPlayer` method on the `Game` data type.
- Smart contract panics if maximum players reached.


```ts
function stake
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_gameId": GameId}'` as parameter
- This invokes the `addNewStaker` method on the `Game` data type.

```ts
function payout
```
- "Change" function (ie. a function that alters contract state)
- Recieves a `'{"_gameId": GameId}'` as parameter
- Smart contract panics if game is still active.

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
function getAllGames
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{"_roomId": RoomId, "gameStatus": Status}'` as parameter
- Returns an array of games with the same status; either created or active or completed games.

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
function getGameStakers
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{"_gameId": GameId}'` as parameter
- Returns the winner of a game.

```ts
function getGameStakers
```
- "View" function (ie. a function that does not alters contract state)
- Recieves a `'{"_gameId": GameId}'` as parameter
- Returns the winner of a game.