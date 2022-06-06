# Tic-Tac-Toe
![CodeGame Version](https://img.shields.io/badge/CodeGame-v0.6-orange)
![CodeGame GameServer Version](https://img.shields.io/badge/GameServer-v0.1-yellow)
![CGE Version](https://img.shields.io/badge/CGE-v0.3-green)

Supercharged version of tic-tac-toe for [CodeGame](https://code-game.org/).
- Virtually unlimited players per game, the map just keeps getting larger.
- Allows game resets without having to create a new game.

## Installation & Running

### From Source

Prerequisits:
- [Node.js](https://nodejs.org/) 8.0+
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
docker pull codegameproject/tic-tac-toe:0.4

# Run container
docker run -d -p <port-on-host-machine>:8080 --name tic-tac-toe codegameproject/tic-tac-toe:0.4
```

## Environment Variables for Customization

- PORT: Overrides the default port the server listens on. The default is `8080`.
- MAX_PLAYER_COUNT: Overrides the default maximum player count per game. The default is `5`. The minimum is `2`.
- MAX_INACTIVE_TIME: Overrides the default maximum time in minutes that a player is allowed to be in a game without at least one socket controlling it. The default is `10` minutes. When all players in a game are inactive the game is deleted automatically.
- HEARTBEAT_INTERVAL: Overrides the default time in seconds between WebSocket pings. The default is `15` minutes.

## License

Licensed under the [GNU General Public License v3](./LICENSE).
