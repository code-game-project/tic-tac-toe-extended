import { join } from "path";
import { Router, json } from "express";
import { GameServer } from "./server";

export function api(gameServer: GameServer): Router {
  const router = Router();
  router.use(json({ limit: '2kb' }));

  router.get("/events", (_, res) => res.contentType('text/plain').sendFile(join(__dirname, "..", "events.cge")));
  router.get("/info", (_, res) => res.json({
    name: "tic_tac_toe",
    cg_version: "0.6",
    display_name: "Tic-tac-toe",
    description: "Tic-tac-toe for CodeGame",
    version: "0.4.0",
    repository_url: "https://github.com/code-game-project/tic-tac-toe.git"
  }));
  router.get("/games", (_, res) => {
    res.json({
      private: Object.keys(gameServer.privateGames).length,
      public: Object.entries(gameServer.publicGames).map(([id, game]) => ({
        id: id, players: Object.keys(game.players).length
      }))
    });
  });
  router.post("/games", (req, res) => {
    res.json({ game_id: gameServer.create(req.body?.public || false) });
  });

  return router;
}
