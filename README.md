# Tic-Tac-Toe-Extended

![CodeGame Version](https://img.shields.io/badge/CodeGame-v0.8-orange)
![CGE Version](https://img.shields.io/badge/CGE-v0.4-green)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D%20v14.0-brightgreen)

A supercharged version of tic-tac-toe for [CodeGame](https://code-game.org/).
- Virtually unlimited players per game, the board's size just keeps increasing.
- Allows game resets without having to create a new game.

## Installation & Running

### From Source

Prerequisits:
- [Node.js](https://nodejs.org/) 14.0+
- [NPM](https://npmjs.org/)

```sh
# Clone this repository
git clone https://github.com/code-game-project/tic-tac-toe.git

# Install dependencies
npm install

# Build project
npm run build

# Run server
npm start
```

### From Docker Hub

Prerequisits:
- [Docker](https://docker.com/)

```sh
# Download image
docker pull codegameproject/tic-tac-toe:<tagname>

# Run container
docker run -d -p <port-on-host-machine>:8080 --name tic-tac-toe codegameproject/tic-tac-toe:<tagname>
```

## Environment Variables for Customization

- CG_PORT: Overrides the default port the server listens on. The default is `8080`.
- CG_MAX_GAME_COUNT: Overrides the default maximum game count per server. The default is `500`. The minimum is `1`.
- CG_MAX_PLAYER_COUNT: Overrides the default maximum player count per game. The default is `6`. The minimum is `1`.
- CG_MAX_INACTIVE_TIME: Overrides the default maximum time in minutes that a player is allowed to be in a game without at least one socket controlling it. The default is `10` minutes. When all players in a game are inactive the game is deleted automatically.
- CG_HEARTBEAT_INTERVAL: Overrides the default time between WebSocket pings. The default is `10 * 60` seconds.

## License

Licensed under the [GNU Affero General Public License v3](./LICENSE).
