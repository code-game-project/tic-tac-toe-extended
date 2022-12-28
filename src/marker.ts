import { Player } from "@code-game-project/server";
import { TicTacToe } from "./tic-tac-toe.js";
import type { Commands } from "./game-types";

export class Marker extends Player {
  protected game: TicTacToe;

  public constructor(game: TicTacToe, username: string) {
    super(username);
    this.game = game;
  }

  public handleCommand(command: Commands): boolean {
    switch (command.name) {
      case "start": this.game.start(this); break;
      case "mark": this.game.mark(command.data.field, this); break;
      default: return false;
    }
    return true;
  }
}
