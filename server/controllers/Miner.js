// Import custom ads to show to the user
const Ads = require('./Ads.js');

// Import basic contracts
const basicContracts = require('./../miner/basicContracts.js');

// Render the main page, pass in useful data to the template engine
const main = (req, res) => {
  res.render('miner');
};

// Get all available basic asteroid contracts
const getContracts = (req, res) => {
  if (!basicContracts) {
    res.status(500).json({ error: 'No contracts available at this time.' });
  }

  // Return list of basic contracts (add in player contracts as well)
  res.status(200).json({ basicContracts });
};

// Return a random ad from Robo Corp
const getAd = (req, res) => {
  const randomAd = Ads.getRandomAd();

  if (!randomAd) {
    return res.status(500).json({ error: 'No ad content found on server' });
  }

  return res.status(200).json({ ad: randomAd });
};

module.exports = {
  main,
  getContracts,
  getAd,
};
