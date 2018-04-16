// Render the main page, pass in useful data to the template engine
const main = (req, res) => {
  res.render('miner');
};

module.exports = {
  main,
};
