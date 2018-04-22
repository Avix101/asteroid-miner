// Import node modules
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');

// Custom controllers
const controllers = require('./controllers');

// Custom middleware
const mid = require('./middleware');

// Attach routes to the main express application
const attach = (app) => {
  // Provide access to psuedo-directory /assets which maps to the static assets in /hosted
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted`)));

  // Provide access to psuedo-directory /webfonts for fontawesome
  app.use('/webfonts', express.static(path.resolve(`${__dirname}/../hosted/webfonts/`)));

  // Provide favixon when the browser requests it
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));

  // Handle main http requests (GET and POST)
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/updatePassword', mid.requiresLogin, controllers.Account.updatePassword);

  // Additional routes go here!
  app.get('/getAd', mid.requiresLogin, controllers.Miner.getAd);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/miner', mid.requiresLogin, controllers.Miner.main);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  // In the event that none of the above match, run the notFound middleware
  app.get('*', mid.notFound);
};

module.exports = {
  attach,
};