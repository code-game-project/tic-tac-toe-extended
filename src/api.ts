import { join } from "path";
import { Router } from "express";
import { GameServer } from "./server";

export function api(gameServer: GameServer): Router {
  const router = Router();
  router.get("/events", (req, res) => res.sendFile(join("..", "tic_tac_toe.cge")));
  router.get("/info", (req, res) => res.json({
    name: "tic_tac_toe",
    cg_version: "0.2.1",
    display_name: "Tic-tac-toe",
    description: "Tic-tac-toe for CodeGame",
    version: "0.0.1",
    repository_url: "https://github.com/code-game-project/tic-tac-toe.git"
  }));
  router.get("/games", (req, res) => {
    res.json({
      private: Object.keys(gameServer.privateGames).length,
      public: Object.entries(gameServer.publicGames).map(([id, game]) => ({
        id: id, players: Object.keys(game.players).length
      }))
    });
  });
  return router;
}
