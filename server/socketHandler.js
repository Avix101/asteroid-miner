// Import node modules
const xxh = require('xxhashjs');

// Import custom modules
const miner = require('./miner');
// const roomHandler = require('./instanceHandler.js'); //Import later when used

const models = require('./models');

const { Contract } = models;
const { SubContract } = models;
const { Account } = models;

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

// Move a player into a game room (create / join)
const joinGame = (sock, id) => {
  // Make a new game room or add the user to an existing one
  const socket = sock;
  if (!miner.game.hasGame(id)) {
    Contract.ContractModel.findById(id, (err, contract) => {
      if (err || !contract) {
        socket.emit('errorMessage', { error: 'Could not find contract' });
        return;
      }

      // Ensure that this client owns the requested contract
      if (socket.handshake.session.account._id.toString() !== contract.ownerId.toString()) {
        socket.emit('errorMessage', { error: 'You do not own that contract' });
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
};

// Setup sockets and attach custom events
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
      joinGame(socket, id);
    });

    // Process a request to start mining as part of a subcontract
    socket.on('mineSub', (data) => {
      if (!verifyDataIntegrity(data, ['subContractId'])) {
        return;
      }

      const subId = data.subContractId;
      SubContract.SubContractModel.findById(subId, (err, subContract) => {
        if (err || !subContract) {
          socket.emit('errorMessage', { error: 'Could not find sub contract' });
          return;
        }

        if (subContract.subContractorId.toString()
          !== socket.handshake.session.account._id
        ) {
          socket.emit('errorMessage', { error: 'You do not own that sub contract' });
          return;
        }

        socket.sub = subContract;
        joinGame(socket, subContract.contractId);
      });
    });

    // Process clicks sent to the server
    socket.on('click', (data) => {
      miner.game.addClick(socket.roomJoined, data.mouse);

      // Also fulfill sub contract stuff
      if (socket.sub) {
        // Maybe switch to miner.game.handleSubClick(...etc)

        if (socket.sub.progress >= socket.sub.clicks) {
          return;
        }

        socket.sub.progress += 1;

        // If the sub contract is complete
        if (socket.sub.progress >= socket.sub.clicks) {
          socket.sub.progress = socket.sub.clicks;

          // Find the sub contractor's account
          Account.AccountModel.findById(socket.sub.subContractorId, (err, acc) => {
            if (err || !acc) {
              socket.emit('errorMessage', { error: 'Sub contract completion not saved' });
              return;
            }

            const account = acc;
            account.bank.gb += socket.sub.rewards.gb;
            account.bank.iron += socket.sub.rewards.iron;
            account.bank.copper += socket.sub.rewards.copper;
            account.bank.sapphire += socket.sub.rewards.sapphire;
            account.bank.emerald += socket.sub.rewards.emerald;
            account.bank.ruby += socket.sub.rewards.ruby;
            account.bank.diamond += socket.sub.rewards.diamond;

            account.markModified('bank');
            const savePromise = account.save();

            savePromise.then(() => {
              socket.emit('successMessage', {
                message: 'Sub contract completed! Rewards have been credited to your account',
              });
              socket.sub.remove();
              socket.sub = null;
            });
          });
        } else {
          socket.sub.save();
        }
      }
    });

    // Process a request for an update regarding an account's bank
    socket.on('getMyBankData', () => {
      // Grab the updated account data
      Account.AccountModel.findById(socket.handshake.session.account._id, (err, acc) => {
        if (err || !acc) {
          socket.emit('errorMessage', { error: 'Could not retrieve bank data' });
          return;
        }

        const account = acc;

        // Store the new data
        socket.handshake.session.account = Account.AccountModel.toAPI(account);

        socket.emit('accountUpdate', {
          bank: socket.handshake.session.account.bank,
        });
      });
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
