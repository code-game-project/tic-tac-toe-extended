import { v4 } from "uuid";
import { WebSocket, MessageEvent } from "ws";
import { Player } from "./player";
import { GameServer } from "./server";
import * as std from "./standard-events";
import { Events } from "./tic-tac-toe-events";

const HEARTBEAT_INTERVAL = 15 * 60;

export class Socket {
  private server: GameServer;
  private gameId?: string;
  private player?: Player;
  private socket: WebSocket;
  public readonly socketId: string = v4();
  private connectionAlive: boolean = true;
  private heartbeatInterval?: NodeJS.Timer;

  public constructor(socket: WebSocket, server: GameServer) {
    this.server = server;
    this.socket = socket;
    this.socket.addEventListener("message", (message: MessageEvent) => this.handleMessage(message));
    this.startHeartbeat();
  }

  /**
   * Pings the Client every `HEARTBEAT_INTERVAL` seconds and terminates
   * the WebSocket connection if the client does not respond
   */
  private startHeartbeat() {
    this.socket.on('pong', () => this.connectionAlive = true);
    this.socket.on('close', () => this.heartbeatInterval && clearInterval(this.heartbeatInterval));
    this.heartbeatInterval = setInterval(() => {
      if (this.connectionAlive === false) this.socket.terminate();
      this.connectionAlive = false;
      this.socket.ping();
    }, HEARTBEAT_INTERVAL * 1000);
  }

  /**
   * Handles messages that that are sent to this `Socket` its peer
   * @param message the message event
   */
  private handleMessage(message: MessageEvent) {
    try {
      const deserialized = JSON.parse(message.data.toString());
      if (typeof deserialized !== "object") {
        this.emit("server", {
          name: "cg_error",
          data: { reason: "Message must represent a JSON object." }
        });
      } else if (!this.handleEvent(deserialized)) {
        this.emit("server", {
          name: "cg_error",
          data: { reason: `This server does not handle '${deserialized.name}' events.` }
        });
      }
    } catch (_err) {
      this.emit("server", {
        name: "cg_error",
        data: { reason: "Unable to deserialize message." }
      });
    }
  }

  /**
   * Handles events sent to this `Socket`
   * @param event the event
   * @returns if an the event was handled
   */
  public handleEvent(event: std.Events | Events): boolean {
    try {
      switch (event.name) {
        case "cg_create":
          this.emit("server", {
            name: "cg_created",
            data: {
              game_id: (this.gameId = this.server.create(event.data.public))
            }
          });
          break;
        case "cg_join":
          this.player = this.server.join(event.data.game_id, event.data.username, this);
          this.gameId = event.data.game_id;
          break;
        case "cg_leave":
          if (this.player) this.player.leave();
          if (this.gameId) this.server.leaveGame(this.gameId);
          break;
        case "cg_connect":
          this.player = this.server.connect(
            event.data.game_id,
            event.data.player_id,
            event.data.secret,
            this
          );
          this.gameId = event.data.game_id;
          break;
        case "start": this.player?.start(); break;
        case "mark": this.player?.mark(event.data.row, event.data.column); break;
        default: return false;
      }
    } catch (err) {
      this.emit("server", {
        name: "cg_error",
        data: { reason: String(typeof err === "object" ? JSON.stringify(err) : String(err)) }
      });
    }
    return true;
  }

  /**
   * Sends an event to this `Socket`'s peer
   * @param origin the player_id that triggered the event
   * @param event the event
   */
  public emit(origin: string, event: std.Events | Events) {
    try {
      this.socket.send(JSON.stringify({ origin, event }));
    } catch (err) {
      console.error(err);
    }
  }
}
