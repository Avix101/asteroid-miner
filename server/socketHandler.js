// Import node modules
const xxh = require('xxhashjs');

// Import custom modules
const miner = require('./miner');
// const roomHandler = require('./instanceHandler.js'); //Import later when used

const models = require('./models');

const { Contract } = models;
const { SubContract } = models;
const { PartnerContract } = models;
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
      if (contract.subContractorId) {
        if (socket.handshake.session.account._id.toString()
          !== contract.subContractorId.toString()
        ) {
          socket.emit('errorMessage', { error: 'You do not own that sub contract' });
          return;
        }
      } else if (socket.handshake.session.account._id.toString() !== contract.ownerId.toString()) {
        socket.emit('errorMessage', { error: 'You do not own that contract' });
        return;
      }


      // Avoid rapidly jumping into the same room
      if (socket.roomJoined.toString() === id.toString()) {
        return;
      }

      // Alert the users in the previous room (if there is one)
      // that the player just left
      if (socket.roomJoined) {
        io.sockets.in(socket.roomJoined).emit('playerLeave', { hash: socket.hash });
      }

      // Have the socket join the new gameroom
      socket.leave(socket.roomJoined);
      socket.join(id);
      socket.roomJoined = id;

      miner.game.createGame(id);
      miner.game.generateAsteroid(id, contract, (asteroid) => {
        io.sockets.in(id).emit('spawnAsteroid', { asteroid });

        if (socket.sub) {
          socket.emit('subContractUpdate', { progress: socket.sub.progress, clicks: socket.sub.clicks });
        }
      });
    });
  } else {
    const asteroid = miner.game.getAsteroid(id);

    // Avoid rapidly jumping into the same room
    if (socket.roomJoined.toString() === id.toString()) {
      return;
    }

    // Alert the users in the previous room (if there is one)
    // that the player just left
    if (socket.roomJoined) {
      io.sockets.in(socket.roomJoined).emit('playerLeave', { hash: socket.hash });
    }

    // Have the socket join the new gameroom
    socket.leave(socket.roomJoined);
    socket.join(id);
    socket.roomJoined = id;

    socket.emit('spawnAsteroid', { asteroid });

    if (socket.sub) {
      socket.emit('subContractUpdate', { progress: socket.sub.progress, clicks: socket.sub.clicks });
    }
  }
};

// Join a Partner room, these are meant to be multiplayer.
const joinPartnerGame = (sock, id) => {
  const socket = sock;
  if (!miner.game.hasGame(id)) {
    PartnerContract.PartnerContractModel.findById(id, (err, contract) => {
      if (err || !contract) {
        socket.emit('errorMessage', { error: 'Could not find partner contract' });
        return;
      }

      // Avoid rapidly jumping into the same room
      if (socket.roomJoined.toString() === id.toString()) {
        return;
      }

      // Alert the users in the previous room (if there is one)
      // that the player just left
      if (socket.roomJoined) {
        io.sockets.in(socket.roomJoined).emit('playerLeave', { hash: socket.hash });
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

    // Avoid rapidly jumping into the same room
    if (socket.roomJoined.toString() === id.toString()) {
      return;
    }

    // Alert the users in the previous room (if there is one)
    // that the player just left
    if (socket.roomJoined) {
      io.sockets.in(socket.roomJoined).emit('playerLeave', { hash: socket.hash });
    }

    socket.leave(socket.roomJoined);
    socket.join(id);
    socket.roomJoined = id;

    socket.emit('spawnAsteroid', { asteroid });
  }
};

// Limits for sockets
// const DDOS = 1000;
const TOO_MANY_CLICKS = 50;

// Keeps track of # of socket requests
// let requestCounter = {};
let clickCounter = {};

// Checks and clears the rate limiter every 1000ms
/* const checkRateLimiter = () => {
  const socketKeys = Object.keys(requestCounter);
  for (let i = 0; i < socketKeys.length; i++) {
    const key = socketKeys[i];
    if (requestCounter[key] > DDOS) {
      if (io.sockets.connected[key]) {
        io.sockets.connected[key].emit('errorMessage', {
          error:
          'DDOS attack detected. This is a serious violation.
          Connection broken by angry server gods.',
        });
        io.sockets.connected[key].disconnect();
      }
    }
  }

  requestCounter = {};
}; */

// Checks and clears the click limiter every 1000ms
const checkClickLimiter = () => {
  const socketKeys = Object.keys(clickCounter);
  for (let i = 0; i < socketKeys.length; i++) {
    const key = socketKeys[i];
    if (clickCounter[key] > TOO_MANY_CLICKS) {
      if (io.sockets.connected[key]) {
        io.sockets.connected[key].emit('errorMessage', {
          error: 'Auto-Mining tool usage detected. Connection broken by Robo Corp.',
        });
        io.sockets.connected[key].disconnect();
      }
    }
  }

  clickCounter = {};
};

// Run both checks every second
setInterval(() => {
  // checkRateLimiter();
  checkClickLimiter();
}, 1000);

// Setup sockets and attach custom events
const init = (ioInstance) => {
  io = ioInstance;

  io.on('connection', (sock) => {
    const socket = sock;

    // General rate limiter for sockets
    /* socket.use((packet, next) => {
      if (!requestCounter[socket.id]) {
        requestCounter[socket.id] = 1;
      } else {
        requestCounter[socket.id]++;
      }

      next();
    }); */

    // Create a new hash for the connected client
    const time = new Date().getTime();
    const hash = xxh.h32(`${socket.id}${time}`, 0x14611037).toString(16);
    const r = Math.floor(Math.random() * 200) + 55;
    const g = Math.floor(Math.random() * 200) + 55;
    const b = Math.floor(Math.random() * 200) + 55;
    const color = { r, g, b };

    socket.hash = hash;
    socket.color = color;

    // Join the lobby initially
    socket.join('lobby');
    socket.roomJoined = 'lobby';

    socket.emit('playerInfo', {
      hash,
      color,
    });

    // Process a request to start mining
    socket.on('mine', (data) => {
      // Ensure the integrity of data sent via sockets
      if (!verifyDataIntegrity(data, ['contractId'])) {
        return;
      }

      // Make sure users stop working on their subcontract
      if (socket.sub) {
        socket.sub = null;
        socket.emit('noSub');
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
          !== socket.handshake.session.account._id.toString()
        ) {
          socket.emit('errorMessage', { error: 'You do not own that sub contract' });
          return;
        }

        // If the socket switches from a non sub to a sub (same asteroid)
        if (!socket.sub && subContract.contractId.toString() === socket.roomJoined.toString()) {
          socket.emit('subContractUpdate', {
            progress: subContract.progress,
            clicks: subContract.clicks,
          });
        }

        socket.sub = subContract;
        joinGame(socket, subContract.contractId);
      });
    });
    // Process a request to start mining a partner contract
    socket.on('minePartner', (data) => {
      if (!verifyDataIntegrity(data, ['partnerContractId'])) {
        return;
      }

      // Make sure users stop working on their subcontract
      if (socket.sub) {
        socket.sub = null;
      }

      const partnerId = data.partnerContractId;

      PartnerContract.PartnerContractModel.findById(partnerId, (err, partnerContract) => {
        if (err || !partnerContract) {
          socket.emit('errorMessage', { error: 'Could not find partner contract' });
          return;
        }

        socket.partner = data.partnerContractId;
        joinPartnerGame(socket, data.partnerContractId);
      });
    });

    // Process clicks sent to the server
    socket.on('click', (data) => {
      // Attempt to detect auto-clicking usage
      if (!clickCounter[socket.id]) {
        clickCounter[socket.id] = 1;
      } else {
        clickCounter[socket.id]++;
      }

      miner.game.addClick(socket.roomJoined, data.mouse, socket.handshake.session.account.power);

      io.sockets.in(socket.roomJoined).emit('click', { hash: socket.hash });

      // Also fulfill sub contract stuff
      if (socket.sub) {
        // Maybe switch to miner.game.handleSubClick(...etc)

        if (socket.sub.progress >= socket.sub.clicks) {
          return;
        }

        socket.sub.progress += socket.handshake.session.account.power;

        // If the sub contract is complete
        if (socket.sub.progress >= socket.sub.clicks) {
          socket.sub.progress = socket.sub.clicks;

          // Find the sub contractor's account
          Account.AccountModel.findById(socket.sub.subContractorId, (err, acc) => {
            if (err || !acc) {
              socket.emit('errorMessage', { error: 'Sub contract completion not saved' });
              return;
            }

            // Credit them with their due resources
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
              socket.emit('finishSubContract', { rewards: socket.sub.rewards });
              socket.sub.remove();
              socket.sub = null;
            });
          });
        } else {
          socket.sub.save();
        }

        // Update the client's sub contract progress
        socket.emit('subContractUpdate', { progress: socket.sub.progress, clicks: socket.sub.clicks });
      }
    });

    // Process a request for a player to update their position
    socket.on('playerUpdate', (data) => {
      if (!verifyDataIntegrity(data, ['prevX', 'prevY', 'destX', 'destY', 'ratio'])) {
        return;
      }

      const playerData = {
        hash: socket.hash,
        prevX: data.prevX,
        prevY: data.prevY,
        destX: data.destX,
        destY: data.destY,
        ratio: data.ratio,
        color: socket.color,
      };
      socket.to(socket.roomJoined).emit('playerUpdate', playerData);
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

    // Process a client's disconnect from the server
    socket.on('disconnect', () => {
      io.sockets.in(socket.roomJoined).emit('playerLeave', { hash: socket.hash });
    });
  });
};

// Complete an asteroid and notify users
const finishAsteroid = (contractId, contract) => {
  // Iterate through clients connected to the room (id = contractId)
  const clients = io.sockets.adapter.rooms[contractId];
  const socketIds = Object.keys(clients.sockets);
  for (let i = 0; i < socketIds.length; i++) {
    const clientId = socketIds[i];

    if (io.sockets.connected[clientId]) {
      const client = io.sockets.connected[clientId];
      if (client.handshake.session.account._id.toString()
        === contract.ownerId.toString()
      ) {
        client.emit('finishAsteroid', { rewards: contract.asteroid.rewards });
      } else {
        client.emit('cancelSubContract');
        client.sub = null;
      }
    }
  }
};

// Complete a partner contract / asteroid and notify users
const finishPartnerAsteroid = (contractId, id, rewards) => {
  // Iterate through clients connected to the room (id = contractId)
  const clients = io.sockets.adapter.rooms[contractId];
  const socketIds = Object.keys(clients.sockets);
  for (let i = 0; i < socketIds.length; i++) {
    const clientId = socketIds[i];

    if (io.sockets.connected[clientId]) {
      const client = io.sockets.connected[clientId];
      if (client.handshake.session.account._id.toString()
        === id.toString()
      ) {
        client.emit('finishAsteroid', { rewards });
      }
    }
  }
};

// Update all existing games
const updateGames = () => {
  miner.game.processClicks((contractId, contract) => {
    finishAsteroid(contractId, contract);
  }, (contractId, id, rewards) => {
    finishPartnerAsteroid(contractId, id, rewards);
  });

  miner.game.sendUpdates((roomId, data) => {
    io.sockets.in(roomId).emit('asteroidUpdate', { asteroid: data });
  });

  // Run this update loop every 20 milliseconds
  setTimeout(updateGames, 20);
};

// Begin the update loop
updateGames();

module.exports.init = init;
