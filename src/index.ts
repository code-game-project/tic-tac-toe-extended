import { env } from "process";
import { createServer } from "http";
import * as express from "express";
import * as cors from "cors";
import { api } from "./api";
import { GameServer } from "./server";

const app = express();
app.use(cors({ origin: ["http://localhost", "http://127.0.0.1"] }));
const server = createServer(app);
const gameServer = new GameServer(server);
app.use(api(gameServer));

const PORT = Number(env.PORT || 8080);
server.listen(PORT, () => console.log(`listening on port ${PORT}`));
