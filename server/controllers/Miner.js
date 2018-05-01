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

//Import trade rates
const rates = require('./TradeRates.js');

// Render the main page, pass in useful data to the template engine
const main = (req, res) => {
  res.render('miner');
};

// Ensure input is a number
const validateNumber = (str, min) => {
  const num = parseInt(`${str}`, 10);

  if (Number.isNaN(num)) {
    return min;
  }

  return Math.max(num, min);
};

//Return the current trade / conversion rates for resources
const getRCCTR = (req, res) => {
  if(rates){
    return res.status(200).json({ rates });
  }
  
  return res.status(500).json({ error: 'Conversion rates unavailable' });
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
    let contracts = null;
    let subContracts = null;
    let partnerContracts = null;
    if (err) {
      return res.status(500).json({ error: 'Could not retrieve contracts' });
    }

    if (results) {
      contracts = results.map(contract => ({
        contractId: contract._id,
        asteroid: Asteroid.getBundledDataFor(contract.asteroid),
        partners: contract.partners.length,
        subContractors: contract.subContractors.length,
      }));
    }
    return SubContract.SubContractModel.findSubContractsFor(
      req.session.account._id,
      (er2, res2) => {
        if (er2) {
          // return res.status(200).json({ contracts });
          return res.status(500).json({ error: 'Could not retrieve contracts' });
        }

        if (res2) {
          subContracts = res2.map(subContract => ({
            subContractId: subContract._id,
            progress: subContract.progress,
            clicks: subContract.clicks,
            asteroid: Asteroid.getBundledDataFor(subContract.asteroid),
            rewards: subContract.rewards,
          }));
        }

        return PartnerContract.PartnerContractModel.findReadyPartnerContractsFor(
          req.session.account._id,
          (er3, res3) => {
            if (er3) {
              console.log(er3);
              return res.status(500).json({ error: 'Could not retrieve contracts' });
            }

            if (res3) {
              console.dir(res3);
              partnerContracts = res3.map(partnerContract => ({
                partnerContractId: partnerContract._id,
                owner: partnerContract.ownerId,
                partners: partnerContract.partners,
                asteroid: Asteroid.getBundledDataFor(partnerContract.asteroid),
              }));
            }
            console.dir(partnerContracts);
            return res.status(200).json({ contracts, subContracts, partnerContracts });
          },
        );
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

  return Account.AccountModel.findById(req.session.account._id, (err, acc) => {
    if (err || !acc) {
      return res.status(400).json({ error: 'Could not find your account' });
    }

    const account = acc;
    
    if (account.bank.gb < basicContracts[req.body.ac].price) {
      return res.status(400).json({ error: 'You do not have enough Galaxy Bucks to buy that' });
    }
    
    account.bank.gb -= basicContracts[req.body.ac].price;
    //req.session.account.bank.gb = account.bank.gb;
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

//Sell resources for Galaxy Bucks
const sellResources = (request, response) => {
  const req = request;
  const res = response;
  
  //Validate data
  req.body.iron = validateNumber(req.body.iron, 0);
  req.body.copper = validateNumber(req.body.copper, 0);
  req.body.sapphire = validateNumber(req.body.sapphire, 0);
  req.body.emerald = validateNumber(req.body.emerald, 0);
  req.body.ruby = validateNumber(req.body.ruby, 0);
  req.body.diamond = validateNumber(req.body.diamond, 0);
  
  //Find the user's account
  Account.AccountModel.findById(req.session.account._id, (err, acc) => {
    if(err || !acc){
      return res.status(400).json({ error: 'Could not find your account' });
    }
    
    const account = acc;

    // Subtract resources
    account.bank.iron -= req.body.iron;
    account.bank.copper -= req.body.copper;
    account.bank.sapphire -= req.body.sapphire;
    account.bank.emerald -= req.body.emerald;
    account.bank.ruby -= req.body.ruby;
    account.bank.diamond -= req.body.diamond;

    // Verify account is not negative
    if (
      account.bank.iron < 0 ||
      account.bank.copper < 0 ||
      account.bank.sapphire < 0 ||
      account.bank.emerald < 0 ||
      account.bank.ruby < 0 ||
      account.bank.diamond < 0
    ) {
      return res.status(400).json({ error: "You don't have that many resources to sell" });
    }
    
    account.bank.gb += req.body.iron * rates.iron +
      req.body.copper * rates.copper +
      req.body.sapphire * rates.sapphire +
      req.body.emerald * rates.emerald +
      req.body.ruby * rates.ruby +
      req.body.diamond * rates.diamond;

    account.markModified('bank');
    const savePromise = account.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(account);
      res.status(201).json({ message: 'Resources successfully sold' });
    });

    return savePromise.catch(() => {
      res.status(500).json({ message: 'Resources could not be sold' });
    });
  })
};

const joinContractAsPartner = (request, response) => {
  const req = request;
  const res = response;

  req.body.id = `${req.body.id}`;

  return Account.AccountModel.findById(req.session.account._id, (err, acc) => {
    if (err || !acc) {
      return res.status(400).json({ error: 'Could not find your account' });
    }

    const account = acc;

    req.session.account = Account.AccountModel.toAPI(account);

    return PartnerContract.PartnerContractModel
      .addPartner(req.session.account._id, req.body.id, (error, obj) => {
        if (error) {
          return res.status(400).json({ error: 'Failed to Join' });
        }
        console.log(obj);
        return res.status(201).json({ message: 'Contract successfully joined' });
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

  return Account.AccountModel.findById(req.session.account._id, (err, acc) => {
    if (err || !acc) {
      return res.status(400).json({ error: 'Could not find your account' });
    }

    const account = acc;
    
    if (account.bank.gb < basicContracts[req.body.ac].price) {
      return res.status(400).json({ error: 'You do not have enough Galaxy Bucks to buy that' });
    }
    
    account.bank.gb -= (basicContracts[req.body.ac].price / 4);
    //req.session.account.bank.gb = account.bank.gb;
    account.markModified('bank');
    const accountSave = account.save();

    accountSave.then(() => {
      req.session.account = Account.AccountModel.toAPI(account);

      const template = asteroidTemplates.getRandomTemplate(req.body.ac);
      const newAsteroid = new Asteroid('temp', template, true);

      const contractData = {
        ownerId: req.session.account._id,
        price: basicContracts[req.body.ac].price / 4, // Maximum Partner Amount + 1
        maximumPartners: 3, // replace 3 with number of maximum partners per contract
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
  getRCCTR,
  getContracts,
  getSubContracts,
  getPartnerContracts,
  joinContractAsPartner,
  getMyContracts,
  buyAsteroid,
  sellResources,
  acceptSubContract,
  buyPartnerAsteroid,
  createSubContract,
  getAd,
};
