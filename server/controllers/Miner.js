// Import custom ads to show to the user
const Ads = require('./Ads.js');

// Import custom classes
const classes = require('./../classes');

const { Asteroid } = classes;

// Import custom mongo models
const models = require('./../models');

const { Contract } = models;
const { SubContract } = models;
const { PartnerContract } = models;
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

// Get all available sub contracts
const getSubContracts = (req, res) => {
  SubContract.SubContractModel.findAllOpenSubContracts((err, contracts) => {
    if (err || !contracts) {
      return res.status(500).json({ error: 'Could not retrieve sub contracts' });
    }

    const accountIdCheck = {};
    const accountIds = [];

    // Find all associated owner accounts
    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      if (!accountIdCheck[contract.ownerId]) {
        accountIdCheck[contract.ownerId] = true;
        accountIds.push(contract.ownerId);
      }
    }

    return Account.AccountModel.findByIdMultiple(accountIds, (er2, accs) => {
      if (er2 || !accs) {
        return res.status(500).json({ error: 'Could not retrieve associated accounts' });
      }

      // Load returned accounts for easy access
      const accounts = {};
      for (let i = 0; i < accs.length; i++) {
        accounts[accs[i]._id] = accs[i];
      }

      // Build a returnable set of data
      const data = [];
      for (let i = 0; i < contracts.length; i++) {
        const c = contracts[i];
        data.push({
          subContractId: c._id,
          owner: accounts[c.ownerId].username,
          asteroidClass: c.asteroid.classname,
          clicks: c.clicks,
          rewards: c.rewards,
        });
      }

      return res.status(200).json({ subContracts: data });
    });
  });
};

// Binds a sub contract to a user
const acceptSubContract = (request, response) => {
  const req = request;
  const res = response;

  req.body.id = `${req.body.id}`;

  SubContract.SubContractModel.findById(req.body.id, (err, c) => {
    if (err || !c) {
      return res.status(400).json({ error: 'Sub Contract was not found' });
    }

    if (c.accepted === true) {
      return res.status(400).json({ error: 'Sub Contract has already been accepted' });
    }

    const contract = c;
    contract.accepted = true;
    contract.subContractorId = req.session.account._id;
    const savePromise = contract.save();

    savePromise.then(() => {
      res.status(200).json({ message: 'You have accepted the Sub Contract' });
    });

    return savePromise.catch(() => {
      res.status(500).json({ error: 'Sub Contract could not be accepted' });
    });
  });
};

// Get all available partner contracts
const getPartnerContracts = (req, res) => {
  PartnerContract.PartnerContractModel.findOpenContracts((err, docs) => {
    if (err) {
      return res.status(500).json({ error: 'Could not retrieve contracts' });
    }

    const openContracts = [];
    for (let i = 0; i < docs.length; i++) {
      if (docs[i]._doc.partners.length < docs[i]._doc.maximumPartners) {
        openContracts.push(docs[i]._doc);
      }
    }

    if (!openContracts) {
      return res.status(500).json({ error: 'No contracts available at this time.' });
    }

    return res.status(200).json({ openContracts });
  });
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

    return SubContract.SubContractModel.findSubContractsFor(
      req.session.account._id,
      (er2, res2) => {
        if (er2 || !res2) {
          return res.status(200).json({ contracts });
        }

        const subContracts = res2.map(subContract => ({
          subContractId: subContract._id,
          progress: subContract.progress,
          clicks: subContract.clicks,
          asteroid: Asteroid.getBundledDataFor(subContract.asteroid),
          rewards: subContract.rewards,
        }));

        return res.status(200).json({ contracts, subContracts });
      },
    );
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
      const newAsteroid = new Asteroid('temp', template, true);

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

// Purchase a contract as a partner one

const buyPartnerAsteroid = (request, response) => {
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
      const newAsteroid = new Asteroid('temp', template, true);

      const contractData = {
        ownerId: req.session.account._id,
        maximumPartners: 2, // replace 2 with number of maximum partners per contract
        partners: [],
        asteroid: newAsteroid,
      };

      const newContract = new PartnerContract.PartnerContractModel(contractData);
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

// Ensure input is a number
const validateNumber = (str, min) => {
  const num = parseInt(`${str}`, 10);

  if (Number.isNaN(num)) {
    return min;
  }

  return Math.max(num, min);
};

// Create a sub contract from an existing contract
const createSubContract = (request, response) => {
  const req = request;
  const res = response;

  // Verify and validate data sent from client
  req.body.contract = `${req.body.contract}`;
  req.body.clicks = validateNumber(req.body.clicks, 1);
  req.body.gb = validateNumber(req.body.gb, 0);
  req.body.iron = validateNumber(req.body.iron, 0);
  req.body.copper = validateNumber(req.body.copper, 0);
  req.body.sapphire = validateNumber(req.body.sapphire, 0);
  req.body.emerald = validateNumber(req.body.emerald, 0);
  req.body.ruby = validateNumber(req.body.ruby, 0);
  req.body.diamond = validateNumber(req.body.diamond, 0);

  // Find the original contract
  return Contract.ContractModel.findById(req.body.contract, (err, contract) => {
    if (err || !contract) {
      return res.status(400).json({ error: 'Original contract could not be referenced' });
    }

    // Create a new sub contract
    const subContractData = {
      ownerId: contract.ownerId,
      contractId: contract._id,
      clicks: req.body.clicks,
      asteroid: contract.asteroid,
      rewards: {
        gb: req.body.gb,
        iron: req.body.iron,
        copper: req.body.copper,
        sapphire: req.body.sapphire,
        emerald: req.body.emerald,
        ruby: req.body.ruby,
        diamond: req.body.diamond,
      },
    };

    const newSubContract = new SubContract.SubContractModel(subContractData);

    // Find the owner's account
    return Account.AccountModel.findById(contract.ownerId, (er2, acc) => {
      if (er2 || !acc) {
        return res.status(400).json({ error: 'Original contract owner could not be referenced' });
      }

      const account = acc;

      // Subtract sub contract payment
      account.bank.gb -= newSubContract.rewards.gb;
      account.bank.iron -= newSubContract.rewards.iron;
      account.bank.copper -= newSubContract.rewards.copper;
      account.bank.sapphire -= newSubContract.rewards.sapphire;
      account.bank.emerald -= newSubContract.rewards.emerald;
      account.bank.ruby -= newSubContract.rewards.ruby;
      account.bank.diamond -= newSubContract.rewards.diamond;

      // Verify account is not negative
      if (
        account.bank.gb < 0 ||
        account.bank.iron < 0 ||
        account.bank.copper < 0 ||
        account.bank.sapphire < 0 ||
        account.bank.emerald < 0 ||
        account.bank.ruby < 0 ||
        account.bank.diamond < 0
      ) {
        return res.status(400).json({ error: "You don't have enough to pay for that sub contract" });
      }

      account.markModified('bank');
      account.save();

      const savePromise = newSubContract.save();

      savePromise.then(() => {
        res.status(201).json({ message: 'Sub Contract successfully created' });
      });

      return savePromise.catch(() => {
        res.status(500).json({ message: 'Sub Contract could not be created' });
      });
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
  getSubContracts,
  getPartnerContracts,
  getMyContracts,
  buyAsteroid,
  acceptSubContract,
  buyPartnerAsteroid,
  createSubContract,
  getAd,
};
