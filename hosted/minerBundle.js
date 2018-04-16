"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Asteroid = function () {
  function Asteroid(data, location) {
    var _this = this;

    _classCallCheck(this, Asteroid);

    //Data received from the server
    this.name = data.name;
    this.classname = data.classname;
    this.progress = data.progress;
    this.toughness = data.toughness;

    //Load asteroid image
    var image = new Image();

    image.onload = function () {
      _this.image = image;
    };

    image.src = data.imageFile;

    //Animation / clientside only data
    this.x = location.x;
    this.y = location.y;
    this.radians = 0;
    this.rotateSpeed = -Math.random() * 0.01;
  }

  //Update properties of the asteroid


  _createClass(Asteroid, [{
    key: "update",
    value: function update() {
      this.radians = (this.radians + this.rotateSpeed) % (2 * Math.PI);
    }
  }, {
    key: "updateVals",


    //Update the asteroid according to changes made by the server
    value: function updateVals(data) {
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        this[key] = data[key];
      }

      console.log(this.progress);
    }
  }]);

  return Asteroid;
}();
"use strict";

//Interpolate between two values given a ratio between 0 and 1
var lerp = function lerp(val1, val2, ratio) {
  var component1 = (1 - ratio) * val1;
  var component2 = ratio * val2;
  return component1 + component2;
};

//Clear the given canvas
var clearCanvas = function clearCanvas(cvs, context) {
  context.clearRect(0, 0, cvs.width, cvs.height);
};

//Draw to the display canvas, which is dynamically resizable
var displayFrame = function displayFrame() {

  //If the display canvas doesn't exist, don't draw to it
  if (!canvas) {
    return;
  }

  //Clear the display canvas, draw from the prep canvas
  clearCanvas(canvas, ctx);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(prepCanvas, 0, 0, prepCanvas.width, prepCanvas.height, 0, 0, canvas.width, canvas.height);
  ctx.restore();
};

//Draw and update the asteroid, assuming there is one
var drawAndUpdateAsteroid = function drawAndUpdateAsteroid() {
  if (!asteroid || !asteroid.image) {
    return;
  }

  asteroid.update();
  prepCtx.save();

  prepCtx.translate(asteroid.x, asteroid.y);
  prepCtx.rotate(asteroid.radians);

  prepCtx.drawImage(asteroid.image, -asteroid.image.width / 2, -asteroid.image.height / 2);

  prepCtx.restore();
};

//The main call to draw everything to the prep canvas
var draw = function draw() {

  //Clear the prep canvas
  clearCanvas(prepCanvas, prepCtx);

  //Draw stuff to the prep canvas

  //If the background image has loaded, draw it to the background of the prep canvas
  if (galaxyBg) {
    prepCtx.drawImage(galaxyBg, 0, 0, prepCanvas.width, prepCanvas.height);
  }

  drawAndUpdateAsteroid();

  //Draw the prep canvas to the resized frame of the display canvas
  displayFrame();
};
"use strict";

//Canvas variables
var canvas = void 0,
    ctx = void 0,
    prepCanvas = void 0,
    prepCtx = void 0;
var aspectRatio = 16 / 9;
var percentageOfScreenWidth = 0.6;

//Static image files
var galaxyBg = void 0;

//Variables to manage socket
var socket = void 0,
    hash = void 0;

//Variables to handle update calls
var animationFrame = void 0;

//Variables relating to gamestate
var asteroid = void 0;

//Current view
var pageView = void 0;

var NULL_FUNC = function NULL_FUNC() {};

//Calculate the appropriate viewport dimensions
var calcDisplayDimensions = function calcDisplayDimensions() {
  var width = window.innerWidth * percentageOfScreenWidth;
  var height = width / aspectRatio;

  return {
    width: width,
    height: height
  };
};

//Resize the display canvas if its currently onscreen
var resizeGame = function resizeGame(e) {
  if (pageView === "#miner") {
    var dimensions = calcDisplayDimensions();
    renderGame(dimensions.width, dimensions.height);
  }
};

//Load the requested React view
var loadView = function loadView() {
  //Find the page's hash
  var hash = window.location.hash;
  pageView = hash;

  //Depending on the hash, render the main content
  switch (hash) {
    case "#miner":
      {
        var dimensions = calcDisplayDimensions();
        renderGame(dimensions.width, dimensions.height);
        break;
      }
    case "#contracts":
      {
        renderContracts();
        break;
      }
    case "#highscores":
      {
        renderHighscores();
        break;
      }
    case "#profile":
      {
        renderProfile();
        break;
      }
    default:
      {
        //Default to loading the miner window
        var _dimensions = calcDisplayDimensions();
        renderGame(_dimensions.width, _dimensions.height);
        pageView = "#miner";
        break;
      }
  }
};

//Run this function when the page loads
var init = function init() {

  //Load the requested view
  loadView();

  //Grab static images included in client page download
  //e.g. variable = document.querySelector("#imageId");
  galaxyBg = document.querySelector("#galaxyBg");

  //Construct prep canvas (for building frames)
  prepCanvas = document.createElement('canvas');
  prepCanvas.width = 1920;
  prepCanvas.height = 1080;
  prepCtx = prepCanvas.getContext('2d');

  //Connect to the server via socket.io
  socket = io.connect();

  //Attach custom socket events
  //socket.on('event', eventFunc);
  socket.on('spawnAsteroid', spawnAsteroid);
  socket.on('asteroidUpdate', updateAsteroid);

  //Start the update loop
  animationFrame = requestAnimationFrame(update);
};

//Run the init function when the window loads
window.onload = init;

//Resize the viewport / display canvas when the window resizes
window.addEventListener('resize', resizeGame);

//Load the requested react view when the hash changes
window.addEventListener('hashchange', loadView);
"use strict";

//Construct the main game window
var GameWindow = function GameWindow(props) {
  return React.createElement("canvas", { id: "viewport", width: props.width, height: props.height });
};

var ContractWindow = function ContractWindow(props) {
  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        { className: "display-3" },
        "Contract Selection:"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Choose wisely."
      ),
      React.createElement("hr", { className: "my-4" })
    )
  );
};

var HighscoreWindow = function HighscoreWindow(props) {
  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        { className: "display-3" },
        "Top Miners:"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Only the best of the best could ever hope to be on this page!"
      ),
      React.createElement("hr", { className: "my-4" })
    )
  );
};

var ProfileWindow = function ProfileWindow(props) {
  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        { className: "display-3" },
        "Personal Profile:"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Miner ID: (#) Logs & Account data (SYSTEM INFO)"
      ),
      React.createElement("hr", { className: "my-4" })
    )
  );
};

var ProgressPanel = function ProgressPanel(props) {

  var progressWidth = { width: props.current / props.total * 100 + "%" };

  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        null,
        "Progress"
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "p",
        { className: "lead" },
        "Clicks: ",
        props.current,
        "/",
        props.total
      ),
      React.createElement(
        "div",
        { className: "progress" },
        React.createElement("div", { className: "progress-bar progress-bar-striped progress-bar-animated bg-success",
          role: "progressbar",
          "aria-value": props.current,
          "aria-valuemin": "0",
          "aria-valuemax": props.total,
          style: progressWidth
        })
      )
    )
  );
};

//Render the main game window
var renderGame = function renderGame(width, height) {
  ReactDOM.render(React.createElement(GameWindow, { width: width, height: height }), document.querySelector("#main"));

  //Hook up viewport (display canvas to JS code)
  canvas = document.querySelector("#viewport");
  ctx = canvas.getContext('2d');

  //Add event listeners
  canvas.addEventListener('click', processClick);
  canvas.addEventListener('mousedown', disableExtraActions);
};

//Render the asteroid's progress panel
var renderProgressPanel = function renderProgressPanel(current, total) {
  ReactDOM.render(React.createElement(ProgressPanel, { current: current, total: total }), document.querySelector("#rightPanel"));
};

//Add more handlers and components if necessary
var renderContracts = function renderContracts() {
  ReactDOM.render(React.createElement(ContractWindow, null), document.querySelector("#main"));
};

var renderHighscores = function renderHighscores() {
  ReactDOM.render(React.createElement(HighscoreWindow, null), document.querySelector("#main"));
};

var renderProfile = function renderProfile() {
  ReactDOM.render(React.createElement(ProfileWindow, null), document.querySelector("#main"));
};

//Request a newe csrf token and then execute a callback when one is retrieved
var getTokenWithCallback = function getTokenWithCallback(callback) {
  sendAjax('GET', '/getToken', null, function (result) {
    if (callback) {
      callback(result.csrfToken);
    }
  });
};
'use strict';

//The main update call which runs 60 times a second (ideally)
var update = function update() {

  //Draw to the canvas (prep first, then display)
  draw();

  //Request another animation frame for updating the client
  animationFrame = requestAnimationFrame(update);
};

//Get the mouse position relative to the size of the prep canvas canvas
var getMouse = function getMouse(e) {
  var rect = canvas.getBoundingClientRect();
  var widthRatio = rect.width / prepCanvas.width;
  var heightRatio = rect.height / prepCanvas.height;
  return {
    x: (e.clientX - rect.left) / widthRatio,
    y: (e.clientY - rect.top) / heightRatio
  };
};

//Process a mouse click on the main display canvas
var processClick = function processClick(e) {
  var mousePos = getMouse(e);
  socket.emit('click', { mouse: mousePos });
};

//Process a request from the server to spawn an asteroid
var spawnAsteroid = function spawnAsteroid(data) {
  var location = { x: prepCanvas.width / 2, y: prepCanvas.height / 2 };
  asteroid = new Asteroid(data.asteroid, location);
};

//Process a request from the server to update the asteroid
var updateAsteroid = function updateAsteroid(data) {
  if (!asteroid) {
    return;
  }

  asteroid.updateVals(data.asteroid);
  renderProgressPanel(asteroid.progress, asteroid.toughness);
};
"use strict";

//Hide the success message
var hideNotification = function hideNotification(e) {
  e.preventDefault();
  handleSuccess("", true);
};

//Construct a success message window
var SuccessMessage = function SuccessMessage(props) {

  var className = "alert alert-dismissable alert-success";

  if (props.hide) {
    className = className + " hidden";
  }

  return React.createElement(
    "div",
    { className: className },
    React.createElement(
      "a",
      { href: "#", className: "close", onClick: hideNotification },
      "\xD7"
    ),
    "Success: ",
    props.message
  );
};

//Construct an error message window
var ErrorMessage = function ErrorMessage(props) {

  var className = "alert alert-dismissible alert-danger";

  if (props.hide) {
    className = className + " hidden";
  }

  return React.createElement(
    "div",
    { className: className },
    React.createElement(
      "a",
      { href: "#", className: "close", onClick: hideNotification },
      "\xD7"
    ),
    "Error: ",
    props.message
  );
};

var successMessage = "";
var successRepeatCount = 1;

//Handle a successful action by displaying a message to the user
var handleSuccess = function handleSuccess(message, hide) {

  var msg = message;

  if (successMessage === message) {
    successRepeatCount++;
    msg = message + " (x" + successRepeatCount + ")";
  } else {
    successMessage = msg;
    successRepeatCount = 1;
  }

  ReactDOM.render(React.createElement(SuccessMessage, { message: msg, hide: hide }), document.querySelector("#notificationMessage"));

  $('html, body').scrollTop(0);
};

var errorMessage = "";
var errorRepeatCount = 1;

//Handle an error message by displaying an error message to the user
var handleError = function handleError(message, hide) {

  var msg = message;

  if (errorMessage === message) {
    errorRepeatCount++;
    msg = message + " (x" + errorRepeatCount + ")";
  } else {
    errorMessage = msg;
    errorRepeatCount = 1;
  }

  ReactDOM.render(React.createElement(ErrorMessage, { message: msg, hide: hide }), document.querySelector("#notificationMessage"));

  $('html, body').scrollTop(0);
};

//Redirect the user to a new page
var redirect = function redirect(response) {
  window.location = response.redirect;
};

//Disable extra mouse actions (highlighting text)
var disableExtraActions = function disableExtraActions(e) {
  e.preventDefault();
  return false;
};

//Send an Ajax request to the server to get or post info
var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
