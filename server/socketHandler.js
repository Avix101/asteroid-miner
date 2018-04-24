// Import node modules
const xxh = require('xxhashjs');

// Import custom modules
const miner = require('./miner');
// const roomHandler = require('./instanceHandler.js'); //Import later when used

const models = require('./models');

const { Contract } = models;

let io;

// Function to verify the integrity of data sent via sockets
const verifyDataIntegrity = (data, expectedKeys) => {
  let verified = true;

  if (!data) {
    return false;
  }

  // Verify that the expected keys are present
  for (let i = 0; i < expectedKeys.length; i++) {
    const key = expectedKeys[i];
    verified = data[key] !== undefined;
  }
  return verified;
};

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
    /* if (!miner.game.hasGame('lobby')) {
      miner.game.createGame('lobby');
      miner.game.generateAsteroid('lobby', (asteroid) => {
        io.sockets.in('lobby').emit('spawnAsteroid', { asteroid });
      });
    } else {
      const asteroid = miner.game.getAsteroid('lobby');
      socket.emit('spawnAsteroid', { asteroid });
    } */

    // Process a request to start mining
    socket.on('mine', (data) => {
      // Ensure the integrity of data sent via sockets
      if (!verifyDataIntegrity(data, ['contractId'])) {
        return;
      }

      const id = data.contractId;

      // Make a new game room or add the user to an existing one
      if (!miner.game.hasGame(id)) {
        Contract.ContractModel.findById(id, (err, contract) => {
          if (err || !contract) {
            socket.emit('errorMessage', { error: 'Could not find contract' });
            return;
          }

          // Have the socket join the new gameroom
          socket.leave(socket.roomJoined);
          socket.join(id);
          socket.roomJoined = id;

          miner.game.createGame(id);
          miner.game.generateAsteroid(id, contract, (asteroid) => {
            io.sockets.in(id).emit('spawnAsteroid', { asteroid });
          });
        });
      } else {
        const asteroid = miner.game.getAsteroid(id);

        // Have the socket join the new gameroom
        socket.leave(socket.roomJoined);
        socket.join(id);
        socket.roomJoined = id;

        socket.emit('spawnAsteroid', { asteroid });
      }
    });

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
