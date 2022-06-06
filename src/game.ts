import { env } from "process";
import * as std from "./standard-events";
import { Player } from "./player";
import { Socket } from "./socket";
import { Events } from "./tic-tac-toe-events";

/** Maxiumum amount of players in the one game at a time */
const MAX_PLAYER_COUNT = env.MAX_PLAYER_COUNT ? Math.max(Number(env.MAX_PLAYER_COUNT), 2) : 5;
/** Maximum inactive time of a player in minutes */
const MAX_INACTIVE_TIME = Number(env.MAX_INACTIVE_TIME || 10);
/** Marks an unmarked/empty field */
const UNMARKED = "";

export class Game {
  public readonly players: { [index: string]: Player; } = {};
  public readonly spectators: { [index: string]: Socket; } = {};
  public board: string[] = [];
  private boardSqrt: number = 2;
  private emptyFieldsLeft = 1;
  private gameStarted = false;
  private gameEnded = false;
  private turns: string[] = [];

  /**
   * Checks if the `Game` has any active players
   * @returns `true` if there are active players or they have not been inactive for too long
   */
  public active() {
    let active = false;
    const now = Date.now();
    for (const player of Object.values(this.players)) {
      if (player.active() || player.inactiveSince > now - MAX_INACTIVE_TIME * 60 * 1000) active = true;
    }
    return active;
  }

  /**
   * Emitts an event to all `Player`s and spectators associated with this `Game`
   * @param origin the id of the `Player` that triggered the event
   * @param event the event
   * @param omitPlayersById the ids of the players to which the event should not be sent
   */
  private broadcast(origin: string, event: std.Events | Events, ...omitPlayersById: string[]) {
    for (const [playerId, player] of Object.entries(this.players)) {
      if (omitPlayersById.includes(playerId)) continue;
      player.emit(origin, event);
    }
    for (const specatator of Object.values(this.spectators)) {
      specatator.emit(origin, event);
    }
  }

  /**
   * Adds a new player to the game
   * @param username the username of the new player
   * @param socket the socket that wants to create a new `Player`
   * @returns the new `Player` object
   * @throws if the `MAX_PLAYER_COUNT` is reached or the game has already started
   */
  public newPlayer(username: string, socket: Socket): Player {
    const playerCount = Object.keys(this.players).length;
    if (!this.gameStarted) {
      if (playerCount < MAX_PLAYER_COUNT) {
        const newPlayer = new Player(this, username, socket);
        this.turns.push(newPlayer.playerId);
        this.players[newPlayer.playerId] = newPlayer;
        this.broadcast(newPlayer.playerId, { name: "cg_new_player", data: { username } });
        if (playerCount + 1 === MAX_PLAYER_COUNT) this.start(newPlayer.playerId);
        return newPlayer;
      } else throw "The game is full.";
    } else throw "The game has already started.";
  }

  /**
   * Removes a player from the game
   * @param playerId the id of the player that is to leave the game
   */
  public removePlayer(playerId: string) {
    this.broadcast(playerId, { name: "cg_left" });
    delete this.players[playerId];
  }

  /**
   * Adds a `Socket` to the game as a spectator
   * @param socket the socket that wants to spectate the game
   */
  public addSpectator(socket: Socket) {
    this.spectators[socket.socketId] = socket;
  }

  /**
   * Removes a spectator from the game
   * @param socketId the id of the socket that is to leave the game
   */
  public removeSpectator(socketId: string) {
    delete this.spectators[socketId];
  }

  /**
   * Puts the game into "started mode" and notifies everyone of who's turn it is
   * @param playerId the player that caused the game to start
   */
  public start(playerId: string) {
    const playerCount = Object.keys(this.players).length;
    if (playerCount >= 2) {
      this.drawBoard(playerCount);
      this.gameStarted = true;
      this.gameEnded = false;
      this.broadcast(playerId, { name: "board", data: { board: this.board } });
      this.players[this.currentTurn()].emit(playerId, { name: "my_turn" });
      this.broadcast(playerId, { name: "opponents_turn", data: { player: this.currentTurn() } }, this.currentTurn());
    } else {
      this.players[playerId].emit(playerId, {
        name: "forbidden_action", data: { message: "Not enough players to start. Two players are required." }
      });
    }
  }

  /**
   * Checks if the game has already started
   * @returns `true` if the game has started
   */
  public started(): boolean {
    return this.gameStarted;
  }

  /**
   * Draws the board to fit the amount of players
   * @param players the number of players currently in the game
   */
  private drawBoard(players: number) {
    this.boardSqrt = players + 1;
    const fields = this.boardSqrt ** 2;
    this.emptyFieldsLeft = fields;
    this.board = new Array(fields).fill(UNMARKED);
  }

  /**
   * Gets a field relative another field on the board
   * @param field the field
   * @param rowOffset relative row
   * @param columnOffset relative column
   * @returns the player_id or `UNMARKED` marking the field or `null` if the requested field is out of bounds
   */
  private getField(
    field: number,
    rowOffset: number = 0,
    columnOffset: number = 0
  ): string | null {
    const relativeColumn = field % this.boardSqrt + columnOffset;
    if (relativeColumn < 0 || relativeColumn >= this.boardSqrt) return null;
    const relativeRow = Math.floor(field / this.boardSqrt) + rowOffset;
    if (relativeRow < 0 || relativeRow >= this.boardSqrt) return null;
    const relativeField = relativeRow * this.boardSqrt + relativeColumn;
    if (relativeField >= 0 && relativeField < this.board.length) return this.board[relativeField];
    else return null;
  }

  /**
   * Attempts to mark a field on the board with a `Player`
   * @param field the index of the field
   * @param playerId the player_id of the `Player` that wants to mark the field
   */
  public mark(field: number, playerId: string) {
    if (this.gameStarted) {
      if (!this.gameEnded) {
        if (this.currentTurn() !== playerId) {
          this.players[playerId].emit(playerId, {
            name: "opponents_turn", data: { player: this.currentTurn() }
          });
          return;
        };
        if (this.board[field] === UNMARKED) {
          this.emptyFieldsLeft--;
          this.board[field] = playerId;
          this.broadcast(playerId, { name: "marked", data: { field } });
          this.broadcast(playerId, { name: "board", data: { board: this.board } });
          if (this.isWinningMark(field, playerId)) {
            this.gameEnded = true;
            this.players[playerId].emit(playerId, { name: "finish", data: { result: "winner" } });
            this.broadcast(playerId, { name: "finish", data: { result: "looser" } }, playerId);
          } else if (this.isTie()) {
            this.gameEnded = true;
            this.broadcast(playerId, { name: "finish", data: { result: "tie" } });
          } else {
            const next = this.nextTurn();
            this.players[next].emit(playerId, { name: "my_turn" });
            this.broadcast(playerId, { name: "opponents_turn", data: { player: next } }, next);
          }
        } else if (this.board[field] !== null) {
          this.players[playerId].emit(playerId, {
            name: "forbidden_action", data: { message: "The field has already been marked by another player." }
          });
        } else {
          this.players[playerId].emit(playerId, {
            name: "forbidden_action", data: { message: `The field index is out of bounds. Must be greater than 0 and less than ${this.board.length}.` }
          });
        }
      } else {
        this.players[playerId].emit(playerId, {
          name: "forbidden_action", data: { message: "The game has already ended. Send the 'start' event to restart the game." }
        });
      }
    } else {
      this.players[playerId].emit(playerId, {
        name: "forbidden_action", data: { message: "The game has not started yet. Send the 'start' event to start the game before the maximum player count is reached." }
      });
    }
  }

  /**
   * Gets the player who's turn it currently is
   * @returns the player_id of the `Player` that is up
   */
  public currentTurn(): string {
    return this.turns[0];
  }

  /**
   * Moves the current player to end of the queue
   * @returns the player_id of the `Player` that is up next
   */
  public nextTurn(): string {
    this.turns.push(this.turns.shift() as string);
    return this.currentTurn();
  }

  /**
   * Checks if a mark wins the game
   * @param field the newly marked field
   * @param playerId the player_id of the player that marked the field
   */
  private isWinningMark(field: number, playerId: string): boolean {
    return (
      // top left to bottom right through current
      (this.getField(field, -1, -1) === playerId && this.getField(field, 1, 1) === playerId) ||
      // top center to bottom center through current
      (this.getField(field, -1, 0) === playerId && this.getField(field, 1, 0) === playerId) ||
      // top right to bottom left through current
      (this.getField(field, -1, 1) === playerId && this.getField(field, 1, -1) === playerId) ||
      // horizontal through current
      (this.getField(field, 0, -1) === playerId && this.getField(field, 0, 1) === playerId) ||
      // current to top left
      (this.getField(field, -1, -1) === playerId && this.getField(field, -2, -2) === playerId) ||
      // current to top center
      (this.getField(field, -1, 0) === playerId && this.getField(field, -2, 0) === playerId) ||
      // current to top right
      (this.getField(field, -1, 1) === playerId && this.getField(field, -2, 2) === playerId) ||
      // current to horizontal right
      (this.getField(field, 0, 1) === playerId && this.getField(field, 0, 2) === playerId) ||
      // current to bottom right
      (this.getField(field, 1, 1) === playerId && this.getField(field, 2, 2) === playerId) ||
      // current to bottom center
      (this.getField(field, 1, 0) === playerId && this.getField(field, 2, 0) === playerId) ||
      // current to bottom left
      (this.getField(field, 1, -1) === playerId && this.getField(field, 2, -2) === playerId) ||
      // current to horizontal left
      (this.getField(field, 0, -1) === playerId && this.getField(field, 0, -2) === playerId)
    );
  }

  /** Checks if the game is tied */
  private isTie() {
    // TODO: detect tie when it happens, even before all fields are marked
    return this.emptyFieldsLeft === 0;
  }
}
