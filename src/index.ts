import { env } from "process";
import { fileURLToPath } from 'url';
import { join, dirname } from "path";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { createApi } from "@code-game-project/javascript-server";
import { TicTacToeServer } from "./server.js";
import { TicTacToeSocket } from "./socket.js";

const app = express();
app.use(cors());
const server = createServer(app);
const gameServer: TicTacToeServer = new TicTacToeServer(
  server, (socket) => new TicTacToeSocket(socket, gameServer)
);
app.use(createApi(gameServer, join(dirname(fileURLToPath(import.meta.url)), '..', 'events.cge'), {
  name: "tic_tac_toe",
  cg_version: "0.6",
  display_name: "Tic-tac-toe",
  description: "Tic-tac-toe for CodeGame",
  version: "0.4.0",
  repository_url: "https://github.com/code-game-project/tic-tac-toe.git"
}));

const PORT = Number(env.PORT || 8080);
server.listen(PORT, () => console.log(`listening on port ${PORT}`));
