// Import node modules
const xxh = require('xxhashjs');

// Import custom modules
// const miner = require('./miner'); //Import later used
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

    // Placeholder event, delete when no longer necessary
    socket.on('event', (data) => {
      console.log(data);
    });
  });
};

module.exports.init = init;
