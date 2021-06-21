// Import necessary modules
const http = require('http');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const sharedSession = require('express-socket.io-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const csrf = require('csurf');

// Import express and custom router
const express = require('express');
const router = require('./router.js');

// Import Socket.io library and custom handler
const socketLib = require('socket.io');
const socketHandler = require('./socketHandler.js');

// Import handlebars templating engine
const expressHandlebars = require('express-handlebars');

// Define a port based on the current environment
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Define a database url
const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/AsteroidMiner';

// Define redis secret
const redisSecret = process.env.REDIS_SECRET || 'verysecretkey';

// Connect to Mongo DB using mongoose
mongoose.connect(dbURL, { useNewUrlParser: true });

mongoose.connection.on('error', (err) => {
  throw err;
});

// Grab environment variables for redis if they exist
let redisURL;
let redisPASS;

if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  [, redisPASS] = redisURL.auth.split(':');
} else {
  redisURL = {
    hostname: 'localhost',
    port: 6379,
  };
}

// Create the express application
const app = express();

// Configure application
app.disable('x-powered-by');
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));

// Create a new session object
const sessionObj = session({
  key: 'sessionid',
  store: new RedisStore({
    host: redisURL.hostname,
    port: redisURL.port,
    pass: redisPASS,
  }),
  secret: redisSecret,
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
});

app.use(sessionObj);

// Set up express to use the handlebars template engine
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

// Have the server parse client cookies
app.use(cookieParser());

// Check CSRF token
app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  // No CSRF token!
  return false;
});

// Attach routes to application
router.attach(app);

// Create a server for http traffic
const server = http.createServer(app);

// Attach socket.io lib to main server
const io = socketLib(server);

// Attach middleware to parse socket cookie (client)
io.use(sharedSession(sessionObj, { autoSave: true }));

// Attach custom events to Socket.io lib
socketHandler.init(io);

server.listen(port);
