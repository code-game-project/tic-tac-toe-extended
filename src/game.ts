import { Game, Player, MAX_PLAYER_COUNT } from "@code-game-project/javascript-server";
import { Marker } from "./marker.js";
import { TicTacToeSocket } from "./socket.js";

/** Maxiumum amount of players allowed in one game at a time. */
const MIN_PLAYER_COUNT = 2;
/** Marks an unmarked/empty field */
const UNMARKED = "";

export class TicTacToe extends Game {
  public board: string[] = [];
  private boardSqrt: number = 2;
  private emptyFieldsLeft = 1;
  private gameInProgess = false;
  private turns: string[] = [];

  protected createPlayer(username: string, socket: TicTacToeSocket): Player {
    return new Marker(this, username, socket);
  }

  protected playerAdded(playerId: string) {
    this.turns.push(playerId);
    if (Object.keys(this.players).length === MAX_PLAYER_COUNT) this.start(playerId);
  }

  protected playerRemoved(playerId: string): void {
    this.turns.filter((id) => id !== playerId);
    if (Object.keys(this.players).length < MIN_PLAYER_COUNT) this.stop();
  }

  /**
   * Sets the game state to "in progress" and notifies everyone of who's turn it is
   * @param playerId the player that caused the game to start
   */
  public start(playerId: string) {
    const playerCount = Object.keys(this.players).length;
    if (playerCount >= MIN_PLAYER_COUNT) {
      this.drawBoard(playerCount);
      this.gameInProgess = true;
      this.broadcast(playerId, { name: "board", data: { board: this.board } });
      this.players[this.currentTurn()].emit(playerId, { name: "my_turn" });
      this.broadcast(playerId, { name: "opponents_turn", data: { player: this.currentTurn() } }, this.currentTurn());
    } else {
      this.players[playerId].emit(playerId, {
        name: "forbidden_action", data: { message: "Not enough players to start. Two players are required." }
      });
    }
  }

  /** Sets the game state to "not in progress". */
  private stop() {
    this.gameInProgess = false;
  }

  /**
   * Checks if the game has already started
   * @returns `true` if the game has started
   */
  public inProgress(): boolean {
    return this.gameInProgess;
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
    if (this.inProgress()) {
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
          this.stop();
          this.players[playerId].emit(playerId, { name: "finish", data: { result: "winner" } });
          this.broadcast(playerId, { name: "finish", data: { result: "looser" } }, playerId);
        } else if (this.isTie()) {
          this.stop();
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
        name: "forbidden_action", data: { message: "The game is currently stopped. Send the 'start' event to start or restart the game." }
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
