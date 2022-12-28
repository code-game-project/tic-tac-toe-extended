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

- PORT: Overrides the default port the server listens on. The default is `8080`.

See [@code-game-project/javascript-server](https://github.com/code-game-project/javascript-server#environment-variables-for-customization) for standard variables.

## License

Licensed under the [GNU Affero General Public License v3](./LICENSE).
