import { Game, Player } from "@code-game-project/server";
import { Marker } from "./marker.js";
import { GameConfig, OpponentsTurnEvent, BoardEvent, ForbiddenActionEvent, MyTurnEvent, MarkedEvent, FinishEvent, Result, StartedEvent } from "./game-types.js";
import { Board } from "./board.js";

/** Minimum amount of players required to start a game. */
const MIN_PLAYER_COUNT = 2;
/** The default amount of marks in a row that a player must have to win. */
const DEFAULT_WIN_ROW_SIZE = 3;

const defaultConfig: GameConfig = {
  win_row_size: 3,
  board_size: 3
};

export class TicTacToe extends Game<GameConfig> {
  private inProgess = false;
  private turns: string[] = [];
  private board: Board = new Board(this.config?.win_row_size || DEFAULT_WIN_ROW_SIZE);

  protected configSanitizer(config?: object): GameConfig {
    const complete = Object.assign(defaultConfig, config);
    const sanitized: GameConfig = {
      win_row_size: Math.max(complete.win_row_size, 3),
      board_size: Math.max(complete.board_size, 3)
    };
    return sanitized;
  }

  protected createPlayer(username: string): Player {
    return new Marker(this, username);
  }

  protected playerAdded(player: Player) {
    this.turns.push(player.id);
    if (this.full()) this.start(player);
  }

  protected playerRemoved(player: Player): void {
    this.turns = this.turns.filter((id) => id !== player.id);
  }

  /**
   * Sets the game state to "in progress" and notifies everyone of who's turn it is
   * as long as the `MIN_PLAYER_COUNT` has been reached.
   * @param player the player that wants to start the game.
   */
  public start(player: Player) {
    if (this.getPlayerCount() >= MIN_PLAYER_COUNT) {
      this.disallowJoining();
      this.board.resetAndResize(Math.max(this.config?.board_size || this.getPlayerCount() + 1, 3));
      this.inProgess = true;
      this.broadcastEvent<BoardEvent>({ name: "board", data: { board: this.board.asArray() } });
      this.broadcastEvent<StartedEvent>({ name: "started" });
      this.getPlayer(this.currentTurn()).sendEvent<MyTurnEvent>({ name: "my_turn" });
      this.broadcastEvent<OpponentsTurnEvent>({ name: "opponents_turn", data: { player: this.currentTurn() } }, this.currentTurn());
    } else {
      player.sendEvent<ForbiddenActionEvent>({
        name: "forbidden_action", data: { message: `Not enough players to start. ${MIN_PLAYER_COUNT} players are required.` }
      });
    }
  }

  /** Sets the game state to "not in progress". */
  private stop() {
    this.inProgess = false;
    this.allowJoining();
  }

  /**
   * Attempts to mark a field on the board with a `Player`
   * @param field the index of the field
   * @param player The player that wants to mark the field.
   */
  public mark(field: number, player: Player) {
    if (this.inProgess) {
      if (this.currentTurn() !== player.id) {
        player.sendEvent({ name: "opponents_turn", data: { player: this.currentTurn() } });
        return;
      };
      if (this.board.mark(field, player.id)) {
        this.broadcastEvent<MarkedEvent>({ name: "marked", data: { field } });
        this.broadcastEvent<BoardEvent>({ name: "board", data: { board: this.board.asArray() } });
        if (this.board.isWinningMark(player.id, field)) {
          this.stop();
          player.sendEvent<FinishEvent>({ name: "finish", data: { result: Result.WINNER, winner: player.id } });
          this.broadcastEvent<FinishEvent>({ name: "finish", data: { result: Result.LOOSER, winner: player.id } }, player.id);
        } else if (this.board.isDraw()) {
          this.stop();
          this.broadcastEvent<FinishEvent>({ name: "finish", data: { result: Result.DRAW, winner: "" } });
        } else {
          const next = this.nextTurn();
          this.getPlayer(next).sendEvent<MyTurnEvent>({ name: "my_turn" });
          this.broadcastEvent<OpponentsTurnEvent>({ name: "opponents_turn", data: { player: next } }, next);
        }
      } else if (this.board.getField(field) !== null) {
        player.sendEvent({
          name: "forbidden_action",
          data: {
            message: "The field has already been marked by another player."
          }
        });
      } else {
        player.sendEvent({
          name: "forbidden_action",
          data: {
            message: `The field index is out of bounds. Must be greater than 0 and less than ${this.board.size()}.`
          }
        });
      }
    } else {
      player.sendEvent({
        name: "forbidden_action",
        data: {
          message: "The game is currently stopped. Send the 'start' command to start or restart the game."
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
}
