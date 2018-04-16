// Do game logic here
const physicsHandler = require('./collision.js');

const clicks = [];
const asteroids = [];

const processClicks = (players, io) => {
  // players will be used to cross reference hashes later and io to emit later...
  // Delete when we finally implement players and io
  console.log(players);
  console.log(io);


  for (let i = 0; i < clicks.length; i++) {
    for (let z = 0; z < asteroids.length; i++) {
      if (physicsHandler.checkIfClicked(clicks[i], asteroids[z])) {
        console.log('clicked');
      }
    }
    clicks.splice(i);
    i--;
  }
};

const addClick = (click) => {
  clicks.push(click);
};

module.exports = {
  processClicks,
  addClick,
};
