// Import node modules
const xxh = require('xxhashjs');

// Import custom modules
const miner = require('./miner');
// const roomHandler = require('./instanceHandler.js'); //Import later when used

// const models = require('./models'); //Import later when used

let io;

const init = (ioInstance) => {
  io = ioInstance;

  io.on('connection', (sock) => {
    const socket = sock;

    // Create a new hash for the connected client
    const time = new Date().getTime();
    const hash = xxh.h32(`${socket.id}${time}`, 0x14611037).toString(16);

    socket.hash = hash;

    // Join the lobby initially
    socket.join('lobby');
    socket.roomJoined = 'lobby';

    // If the the game room doesn't exist, create it.
    // Otherwise send the current asteroid to the player
    if (!miner.game.hasGame('lobby')) {
      miner.game.createGame('lobby');
      miner.game.generateAsteroid('lobby', (asteroid) => {
        io.sockets.in('lobby').emit('spawnAsteroid', { asteroid });
      });
    } else {
      const asteroid = miner.game.getAsteroid('lobby');
      socket.emit('spawnAsteroid', { asteroid });
    }

    // Process clicks sent to the server
    socket.on('click', (data) => {
      miner.game.addClick(socket.roomJoined, data.mouse);
    });
  });
};

// Update all existing games
const updateGames = () => {
  miner.game.processClicks();

  miner.game.sendUpdates((roomId, data) => {
    io.sockets.in(roomId).emit('asteroidUpdate', { asteroid: data });
  });

  // Run this update loop every 20 milliseconds
  setTimeout(updateGames, 20);
};

// Begin the update loop
updateGames();

module.exports.init = init;
