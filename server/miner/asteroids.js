const fs = require('fs');

const imageDir = '/hosted/img/asteroids';
const imageLink = '/assets/img/asteroids/';
const asteroidStruct = {};

// Asteroid class templates
const asteroidTemplates = require('./basicContracts.js');

// Dynamically collect all asteroid images within the asteroids/ hosted folder
fs.readdir(`${__dirname}/../../${imageDir}`, (err, imageFiles) => {
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const imageFile = `${imageLink}${file}`;
    const asteroidClass = file.charAt(0);
    const [asteroidName] = file.substring(1).split('.');

    // Asteroids contain a name identifier and a link to their image
    const asteroidData = {
      name: asteroidName,
      classname: asteroidClass,
      imageFile,
      template: asteroidTemplates[asteroidClass],
    };

    // Group asteroids by class
    if (!asteroidStruct[asteroidClass]) {
      asteroidStruct[asteroidClass] = {};
    }

    // Populate the asteroid struct
    asteroidStruct[asteroidClass][asteroidName] = asteroidData;
  }
});

// Get a random asteroid template of a given class
const getRandomTemplate = (asteroidClass) => {
  if (asteroidClass) {
    if (!asteroidStruct[asteroidClass]) {
      return null;
    }
    // Choose a random asteroid from the requested class
    const asteroidKeys = Object.keys(asteroidStruct[asteroidClass]);
    const randomIndex = Math.floor(Math.random() * asteroidKeys.length);
    const randomKey = asteroidKeys[randomIndex];
    const asteroidTemplate = asteroidStruct[asteroidClass][randomKey];
    return asteroidTemplate;
  }

  return null;
};

module.exports = {
  asteroidStruct,
  getRandomTemplate,
};
