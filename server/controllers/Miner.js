// Import custom ads to show to the user
const Ads = require('./Ads.js');

// Import custom classes
const classes = require('./../classes');

const { Asteroid } = classes;

// Import custom mongo models
const models = require('./../models');

const { Contract } = models;
const { Account } = models;

// Import basic contracts
const basicContracts = require('./../miner/basicContracts.js');

// Import asteroid templates
const asteroidTemplates = require('./../miner/asteroids.js');

// Render the main page, pass in useful data to the template engine
const main = (req, res) => {
  res.render('miner');
};

// Get all available basic asteroid contracts
const getContracts = (req, res) => {
  if (!basicContracts) {
    return res.status(500).json({ error: 'No contracts available at this time.' });
  }

  // Return list of basic contracts (add in player contracts as well)
  return res.status(200).json({ basicContracts });
};

// Get contracts belonging to a user
const getMyContracts = (req, res) =>
  Contract.ContractModel.findContractsFor(req.session.account._id, (err, results) => {
    if (err || !results) {
      return res.status(500).json({ error: 'Could not retrieve contracts' });
    }

    const contracts = results.map(contract => ({
      contractId: contract._id,
      asteroid: Asteroid.getBundledDataFor(contract.asteroid),
      partners: contract.partners.length,
      subContractors: contract.subContractors.length,
    }));

    return res.status(200).json({ contracts });
  });

// Purchase a standard asteroid contract
const buyAsteroid = (request, response) => {
  const req = request;
  const res = response;

  req.body.ac = `${req.body.ac}`;

  if (!basicContracts[req.body.ac]) {
    return res.status(400).json({ error: 'Could not retrieve unknown standard contract' });
  }

  if (req.session.account.bank.gb < basicContracts[req.body.ac].price) {
    return res.status(400).json({ error: 'You do not have enough Galaxy Bucks to buy that' });
  }

  return Account.AccountModel.findById(req.session.account._id, (err, acc) => {
    if (err || !acc) {
      return res.status(400).json({ error: 'Could not find your account' });
    }

    const account = acc;
    account.bank.gb -= basicContracts[req.body.ac].price;
    req.session.account.bank.gb = account.bank.gb;
    account.markModified('bank');
    const accountSave = account.save();

    accountSave.then(() => {
      req.session.account = Account.AccountModel.toAPI(account);

      const template = asteroidTemplates.getRandomTemplate(req.body.ac);
      const newAsteroid = new Asteroid('temp', template);

      const contractData = {
        ownerId: req.session.account._id,
        partners: [],
        subContractors: [],
        asteroid: newAsteroid,
      };

      const newContract = new Contract.ContractModel(contractData);
      const savePromise = newContract.save();

      savePromise.then(() => {
        res.status(201).json({ message: 'Contract successfully created' });
      });

      savePromise.catch(() => {
        res.status(500).json({ error: 'Contract could not be created' });
      });
    });

    return accountSave.catch(() => {
      res.status(400).json({ error: 'Could not find your account' });
    });
  });
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
  getMyContracts,
  buyAsteroid,
  getAd,
};
