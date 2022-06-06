import { Player } from "@code-game-project/javascript-server";
import { TicTacToeSocket } from "./socket.js";
import { TicTacToe } from "./game.js";

export class Marker extends Player {
  protected sockets: { [index: string]: TicTacToeSocket; } = {};
  protected game: TicTacToe;

  public constructor(game: TicTacToe, username: string, socket: TicTacToeSocket) {
    super(username, socket);
    this.sockets[socket.socketId] = socket;
    this.game = game;
  }

  /** Starts or restarts the game */
  public start() {
    this.game.start(this.playerId);
  }

  /**
   * Mark a field on the board with this `Player`'s `player_id`
   * @param field the field
   */
  public mark(field: number) {
    this.game.mark(field, this.playerId);
  }
}
