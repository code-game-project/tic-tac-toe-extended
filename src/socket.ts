import { WebSocket } from "ws";
import { Socket } from "@code-game-project/javascript-server";
import { Events } from "./tic-tac-toe-events.js";
import { TicTacToeServer } from "./server.js";
import { Marker } from "./marker.js";

export class TicTacToeSocket extends Socket {
  protected server: TicTacToeServer;
  protected player?: Marker;

  public constructor(socket: WebSocket, server: TicTacToeServer) {
    super(socket);
    this.server = server;
  }

  public handleEvent(event: Events): boolean {
    try {
      switch (event.name) {
        case "start": this.player?.start(); break;
        case "mark": this.player?.mark(event.data.field); break;
        default: return false;
      }
    } catch (err) {
      this.emit("server", {
        name: "cg_error",
        data: { message: String(err) }
      });
    }
    return true;
  }
}
