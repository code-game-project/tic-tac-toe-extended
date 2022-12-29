import { env } from "process";
import { fileURLToPath } from 'url';
import { join, dirname } from "path";
import { GameServer } from "@code-game-project/server";
import { TicTacToe } from "./tic-tac-toe.js";
import type { GameConfig } from "./event-definitions";

new GameServer<GameConfig>(
  {
    name: "tic_tac_toe_extended",
    display_name: "Tic-Tac-Toe Extended",
    description: "A supercharged version of tic-tac-toe for CodeGame.",
    version: "0.5.0",
    repository_url: "https://github.com/code-game-project/tic-tac-toe-extended.git"
  },
  join(dirname(fileURLToPath(import.meta.url)), '..', 'events.cge'),
  (_protected, config) => new TicTacToe(
    _protected,
    config,
    Number(env.CG_MAX_PLAYER_COUNT),
    Number(env.CG_MAX_INACTIVE_TIME_MINUTES)
  ),
  Number(env.CG_PORT),
  Number(env.CG_MAX_GAME_COUNT),
  Number(env.CG_HEARTBEAT_INTERVAL),
);
