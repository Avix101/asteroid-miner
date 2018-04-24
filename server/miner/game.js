// Do game logic here
const physicsHandler = require('./collision.js');
// const asteroidTemplates = require('./asteroids.js');

// Import custom class
const classes = require('./../classes');

const { Asteroid } = classes;

// Keep track of games (we need to add a game class...)
const games = {};

// Check if a game exists, grab it, or set a game
const hasGame = roomId => games[roomId] !== undefined;
const getGame = roomId => games[roomId];
const setGame = (roomId, game) => {
  games[roomId] = game;
};

// const clicks = [];
// const asteroids = [];

const processClicks = (/* players, io */) => {
  // players will be used to cross reference hashes later and io to emit later...
  // Delete when we finally implement players and io
  /* console.log(players);
  console.log(io); */

  const gameKeys = Object.keys(games);

  for (let i = 0; i < gameKeys.length; i++) {
    const game = getGame(gameKeys[i]);
    for (let z = 0; z < game.clicks.length; z++) { // Bounding rect should depend on asteroid
      if (physicsHandler.checkIfClicked(game.clicks[z], Asteroid.getBoundingRect())) {
        console.log('clicked');
        game.asteroid.mine(1);
      }

      game.clicks.splice(z);
      z--;
    }
  }
};

// Send updates to all games
const sendUpdates = (sendData) => {
  const gameKeys = Object.keys(games);

  for (let i = 0; i < gameKeys.length; i++) {
    const room = gameKeys[i];
    const game = getGame(room);
    const data = game.asteroid.getBundledData();
    sendData(room, data);
  }
};

const addClick = (roomId, click) => {
  if (!hasGame(roomId)) {
    return false;
  }

  const game = getGame(roomId);
  game.clicks.push(click);
  return true;
  // clicks.push(click);
};

const createGame = (roomId) => {
  if (hasGame(roomId)) {
    return false;
  }

  // Replace empty object with class!
  const newGame = { clicks: [] };
  setGame(roomId, newGame);
  return true;
};

const getAsteroid = (roomId) => {
  if (!hasGame(roomId)) {
    return null;
  }

  const game = getGame(roomId);
  return game.asteroid.getBundledData();
};

const generateAsteroid = (roomId, contract, callback) => {
  console.log(contract);
  const newAsteroid = new Asteroid(roomId, contract, false);
  const game = getGame(roomId);

  game.asteroid = newAsteroid;

  if (callback) {
    const asteroid = getAsteroid(roomId);
    callback(asteroid);
  }
};

module.exports = {
  processClicks,
  addClick,
  createGame,
  generateAsteroid,
  getAsteroid,
  sendUpdates,
  hasGame,
  getGame,
};
