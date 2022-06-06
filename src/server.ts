import { GameServer } from "@code-game-project/javascript-server";
import { TicTacToe } from "./game.js";

export class TicTacToeServer extends GameServer {
  protected createGame(): TicTacToe {
    return new TicTacToe();
  }
}
