import { Socket } from "./socket";
import { randomSecret } from "./secret";
import * as std from "./standard-events";
import { Events } from "./tic-tac-toe-events";
import { Game } from "./game";
import { v4 } from "uuid";

export class Player {
  private sockets: { [index: string]: Socket; } = {};
  public inactiveSince = 0;
  private game: Game;
  public readonly playerId: string = v4();
  public readonly username: string;
  private secret: string = randomSecret();

  public constructor(game: Game, username: string, socket: Socket) {
    this.game = game;
    this.username = username;
    this.sockets[socket.socketId] = socket;
    socket.emit(this.playerId, { name: "cg_joined", data: { secret: this.secret } });
  }

  /**
   * Verifies if a given secret is the secret for this `Player`
   * @param secret the secret
   * @returns if the secret is valid
   */
  public verifySecret(secret: string): boolean {
    return this.secret === secret;
  }

  /**
   * Connects a `Socket` to this `Player`
   * 
   * All connected `Socket`s are able to control this `Player` and
   * receive all events emitted to this `Player`
   * @param socket the socket
   */
  public connectSocket(socket: Socket) {
    this.sockets[socket.socketId] = socket;
    socket.emit(this.playerId, { name: "cg_connected", data: { username: this.username } });
    const current = this.game.currentTurn();
    if (current === this.playerId) socket.emit(this.playerId, { name: "my_turn" });
    else socket.emit(this.playerId, { name: "opponents_turn", data: { player: current } });
  }

  /**
   * Disconnects a `Socket` from this `Player`
   * 
   * @param socketId the socket_id of the socket that is to be disconnected
   */
  public disconnectSocket(socketId: string) {
    delete this.sockets[socketId];
    if (Object.keys(this.sockets).length === 0) this.inactiveSince = Date.now();
  }

  /**
   * Checks if the player has any sockets
   * @returns if the player is active
   */
  public active(): boolean {
    return Object.keys(this.sockets).length !== 0;
  }

  /**
   * Sends an event to all `Socket`s associated with this `Player`
   * @param origin the player_id that triggered the event
   * @param event the event
   */
  public emit(origin: string, event: std.Events | Events) {
    Object.values(this.sockets).forEach((socket) => socket.emit(origin, event));
  }

  /**
   * Leaves the game
   */
  public leave() {
    this.game.removePlayer(this.playerId);
  }

  /**
   * Starts the game
   */
  public start() {
    this.game.startGame(this.playerId);
  }

  /**
   * Mark a field on the board with this `Player`'s `player_id`
   * @param row the row
   * @param column the column
   */
  public mark(row: number, column: number) {
    this.game.mark(row, column, this.playerId);
  }
}
