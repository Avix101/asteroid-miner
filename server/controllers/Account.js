const models = require('../models');

const { Account } = models;

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY); /* process.env.SENDGRID_API_KEY */

// Render the login page and send a csrf token
const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

// Log a user out
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// Log a user in
const login = (request, response) => {
  const req = request;
  const res = response;

  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  // Verify input
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Authenticate the user
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/miner' });
  });
};

// Sign a user up
const signup = (request, response) => {
  const req = request;
  const res = response;

  // Cast params to strings for the sake of security
  req.body.username = `${req.body.username}`;
  req.body.email = `${req.body.email}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.email || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      email: req.body.email,
      salt,
      bank: {
        gb: 0, iron: 0, copper: 0, sapphire: 0, emerald: 0, ruby: 0, diamond: 0,
      },
      contracts: [],
      password: hash,
      profile_name: req.body.profile_name,
    };

    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    // Save to the database, process a response or handle an error
    savePromise.then(() => {
      // send a sendgrid welcome email
      const msg = {
        to: req.body.email,
        from: 'noreply@asteroidminers.com',
        subject: 'Welcome to Asteroid Miners',
        text: 'Good Luck out there',
        html: '<strong>you will need it</strong>',
      };
      sgMail.send(msg);
      req.session.account = Account.AccountModel.toAPI(newAccount);
      res.json({ redirect: '/miner' });
    });

    savePromise.catch((err) => {
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occured' });
    });
  });
};

// Update a user's password
const updatePassword = (request, response) => {
  const req = request;
  const res = response;

  req.body.newPassword = `${req.body.newPassword}`;
  req.body.newPassword2 = `${req.body.newPassword2}`;
  req.body.password = `${req.body.password}`;
  const { username } = req.session.account;

  if (req.body.newPassword !== req.body.newPassword2) {
    return res.status(400).json({ error: 'Password and confirmation password must match' });
  }

  // Check their old password
  return Account.AccountModel.authenticate(username, req.body.password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong current password' });
    }

    // Generate the hash and salt for the new password
    return Account.AccountModel.generateHash(req.body.newPassword, (salt, hash) => {
      const acc = account;
      acc.password = hash;
      acc.salt = salt;

      const savePromise = acc.save();

      // Save the new password
      savePromise.then(() => {
        req.session.account = Account.AccountModel.toAPI(account);
        res.status(204).send();
      });

      savePromise.catch(() => res.status(500).json({ error: 'Password could not be updated.' }));
    });
  });
};

// 'Purchase' or obtain Galaxy Bucks
const getGalaxyBucks = (request, response) => {
  const req = request;
  const res = response;

  req.body.gb = `${req.body.gb}`;

  // If no Galaxy Bucks amount is specified
  if (!req.body.gb) {
    return res.status(400).json({ error: 'Cannot purchase Galaxy Bucks; no amount specified' });
  }

  // Make sure the user is logged in
  if (!req.session.account) {
    return res.status(400).json({ error: 'You must be logged in to purchase Galaxy Bucks' });
  }

  return Account.AccountModel.findById(req.session.account._id, (err, acc) => {
    if (err || !acc) {
      return res.status(400).json({ error: 'You must be logged in to purchase Galaxy Bucks' });
    }

    // Add requested Galaxy Bucks to account
    const account = acc;
    const gb = parseInt(req.body.gb, 10);
    account.bank.gb += gb;

    // Ensure mongoose updates the user's bank
    account.markModified('bank');
    const savePromise = account.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(account);
      console.log(req.session.account);
      res.status(200).json({ message: `${gb} Galaxy Bucks have been credited to your account` });
    });

    return savePromise.catch(() => res.status(500).json({ error: 'Galaxy Bucks could not be credited to your account' }));
  });
};

// Generate a new csrf token for a user
const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  updatePassword,
  getToken,
  getGalaxyBucks,
};
