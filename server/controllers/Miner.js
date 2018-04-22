// Import custom ads to show to the user
const Ads = require('./Ads.js');

// Render the main page, pass in useful data to the template engine
const main = (req, res) => {
  res.render('miner');
};

const getAd = (req, res) => {
  const randomAd = Ads.getRandomAd();

  if (!randomAd) {
    return res.status(500).json({ error: 'No ad content found on server' });
  }

  return res.status(200).json({ ad: randomAd });
};

module.exports = {
  main,
  getAd,
};
