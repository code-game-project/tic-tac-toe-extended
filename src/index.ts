import { env } from "process";
import { fileURLToPath } from 'url';
import { join, dirname } from "path";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { createApi, GameServer, CG_VERSION } from "@code-game-project/server";
import { TicTacToe } from "./tic-tac-toe.js";
import type { GameConfig } from "./game-types";

const app = express();
app.use(cors());
const server = createServer(app);
const gameServer = new GameServer<GameConfig>(server, (_protected, config) => new TicTacToe(_protected, config));
app.use(createApi(gameServer, join(dirname(fileURLToPath(import.meta.url)), '..', 'events.cge'), {
  name: "tic_tac_toe_extended",
  cg_version: CG_VERSION.join("."),
  display_name: "Tic-Tac-Toe Extended",
  description: "A supercharged version of tic-tac-toe for CodeGame.",
  version: "0.5.0",
  repository_url: "https://github.com/code-game-project/tic-tac-toe-extended.git"
}));

const PORT = Number(env.PORT || 8080);
server.listen(PORT, () => console.log(`listening on port ${PORT}`));
