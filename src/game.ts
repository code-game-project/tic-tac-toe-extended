import { Player } from "./player";
import { Socket } from "./socket";
import * as std from "./standard-events";
import { Events } from "./tic-tac-toe-events";

/** Maxiumum amount of players in the one game at a time */
const MAX_PLAYER_COUNT = Number(process.env.MAX_PLAYER_COUNT || 5);
/** Maximum inactive time of a player in minutes */
const MAX_INACTIVE_TIME = Number(process.env.MAX_INACTIVE_TIME || 10);
/** Marks an unmarked/empty field */
const UNMARKED = "";

export class Game {
  public readonly players: { [index: string]: Player; } = {};
  private board: string[][] = [];
  private board_sqrt?: number;
  private gameStarted = false;
  private turns: string[] = [];

  /**
   * Checks if the `Game` has any active players
   * @returns true if there are active players or they have not been inactive for too long
   */
  public active() {
    let active = false;
    const now = Date.now();
    for (const player of Object.values(this.players)) {
      if (player.active || player.inactiveSince > now - MAX_INACTIVE_TIME * 60 * 1000) active = true;
    }
    return active;
  }

  /**
   * Emitts an event to all `Player`s associated with this `Game`
   * @param origin the id of the `Player` that triggered the event
   * @param event the event
   * @param omitPlayersById the ids of the players to which the event should not be sent
   */
  private broadcast(origin: string, event: std.Events | Events, ...omitPlayersById: string[]) {
    for (const [playerId, player] of Object.entries(this.players)) {
      if (omitPlayersById.includes(playerId)) continue;
      player.emit(origin, event);
    }
  }

  /**
   * Adds a new player to the game
   * @param username the username of the new player
   * @param socket the socket that wants to create a new `Player`
   * @returns the new `Player` object
   * @throws if the `MAX_PLAYER_COUNT` is reached
   */
  public newPlayer(username: string, socket: Socket): Player {
    const playerCount = Object.keys(this.players).length;
    if (playerCount < MAX_PLAYER_COUNT && !this.gameStarted) {
      const newPlayer = new Player(this, username, socket);
      this.turns.push(newPlayer.playerId);
      this.players[newPlayer.playerId] = newPlayer;
      this.broadcast(newPlayer.playerId, { name: "cg_new_player", data: { username } });
      this.drawBoard(playerCount + 1);
      if (playerCount + 1 === MAX_PLAYER_COUNT) this.startGame(newPlayer.playerId);
      return newPlayer;
    } else throw "The game is full";
  }

  /**
   * Removes a player from the game
   * @param playerId the id of the player that it to leave the game
   */
  public removePlayer(playerId: string) {
    delete this.players[playerId];
    this.broadcast(playerId, { name: "cg_left" });
  }

  /**
   * Draws the board to fit the amount of players
   * @param players the number of players currently in the game
   */
  private drawBoard(players: number) {
    this.board_sqrt = 1 + players;
    this.board = [];
    for (let row = 0; row < this.board_sqrt; row++) {
      this.board[row] = [];
      for (let column = 0; column < this.board_sqrt; column++) {
        this.board[row][column] = UNMARKED;
      }
    }
  }

  /**
   * Gets a field on the board
   * @param row the row
   * @param column the column
   * @param rowOffset the offset of the row
   * @param columnOffset the offset of the column
   * @returns the player_id or "empty" marking the field or undefined if the requested field is out of bounds
   */
  private getField(
    row: number,
    column: number,
    rowOffset: number = 0,
    columnOffset: number = 0
  ): string | undefined {
    return this.board[row + rowOffset]?.[column + columnOffset];
  }

  /**
   * Puts the game into "started mode" and notifies everyone of who's turn it is
   * @param playerId the player that caused the game to start
   */
  public startGame(playerId: string) {
    this.gameStarted = true;
    this.broadcast(playerId, { name: "board", data: { board: this.board } });
    this.players[this.currentTurn()].emit(playerId, { name: "my_turn" });
    this.broadcast(playerId, { name: "opponents_turn", data: { player: this.currentTurn() } }, this.currentTurn());
  }

  /**
   * Attempts to mark a field on the board with a `Player`
   * @param row the row
   * @param column the column
   * @param playerId the player_id of the `Player` that wants to mark the field
   */
  public mark(row: number, column: number, playerId: string) {
    if (this.currentTurn() !== playerId) {
      this.players[playerId].emit(playerId, {
        name: "opponents_turn", data: { player: this.currentTurn() }
      });
      return;
    };
    if (this.board[row]?.[column] === UNMARKED) {
      this.board[row][column] = playerId;
      this.broadcast(playerId, { name: "marked", data: { row, column } });
      this.broadcast(playerId, { name: "board", data: { board: this.board } });
      if (this.isWinningMark(row, column, playerId)) {
        this.players[playerId].emit(playerId, { name: "winner" });
        this.broadcast(playerId, { name: "looser" }, playerId);
      } else {
        const next = this.nextTurn();
        this.players[next].emit(playerId, { name: "my_turn" });
        this.broadcast(playerId, { name: "opponents_turn", data: { player: next } }, next);
      }
    } else {
      this.players[playerId].emit(playerId, {
        name: "field_occupied", data: {
          row, column,
          player: this.board[row]?.[column]
        }
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
   * @param column the column of the new mark
   * @param row the row of the new mark
   * @param playerId the player_id of the player that marked the field
   */
  private isWinningMark(row: number, column: number, playerId: string) {
    return (
      // top left to bottom right through current
      (this.getField(row, column, -1, -1) === playerId && this.getField(row, column, 1, 1)) === playerId ||
      // top center to bottom center through current
      (this.getField(row, column, -1, 0) === playerId && this.getField(row, column, 1, 0)) === playerId ||
      // top right to bottom left through current
      (this.getField(row, column, -1, 1) === playerId && this.getField(row, column, 1, -1)) === playerId ||
      // horizontal through current
      (this.getField(row, column, 0, -1) === playerId && this.getField(row, column, 0, 1)) === playerId ||
      // current to top left
      (this.getField(row, column, -1, -1) === playerId && this.getField(row, column, -2, -2)) === playerId ||
      // current to top center
      (this.getField(row, column, -1, 0) === playerId && this.getField(row, column, -2, 0)) === playerId ||
      // current to top right
      (this.getField(row, column, -1, 1) === playerId && this.getField(row, column, -2, 2)) === playerId ||
      // current to horizontal right
      (this.getField(row, column, 0, 1) === playerId && this.getField(row, column, 0, 2)) === playerId ||
      // current to bottom right
      (this.getField(row, column, 1, 1) === playerId && this.getField(row, column, 2, 2)) === playerId ||
      // current to bottom center
      (this.getField(row, column, 1, 0) === playerId && this.getField(row, column, 2, 0)) === playerId ||
      // current to bottom left
      (this.getField(row, column, 1, -1) === playerId && this.getField(row, column, 2, -2)) === playerId ||
      // current to horizontal left
      (this.getField(row, column, 0, -1) === playerId && this.getField(row, column, 0, -2)) === playerId
    );
  }
}
