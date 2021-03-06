"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//The animation class bundles a collection of properties to change over a set period of time
//It also updates its state if given a timestamp
var Animation = function () {
  //Build the animation using the given data
  function Animation(logistics) {
    _classCallCheck(this, Animation);

    var time = 0;
    this.startTime = 0;
    this.currentTime = time;
    this.begin = logistics.begin;
    this.loop = logistics.loop;
    this.timeToFinish = logistics.timeToFinish;
    this.propsBegin = logistics.propsBegin;
    this.propsEnd = logistics.propsEnd;
    this.propsCurrent = {};
    this.complete = false;

    var propKeys = Object.keys(this.propsBegin);
    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      this.propsCurrent[key] = this.propsBegin[key];
    }
  }

  _createClass(Animation, [{
    key: "bind",


    //Binding an animation sets it's starting time to the current time and begins the animation
    value: function bind(currentTime) {
      this.startTime = currentTime;
      this.currentTime = currentTime;
    }

    //Animations use the current time to update its current status

  }, {
    key: "update",
    value: function update(currentTime) {
      var timeElapsed = currentTime - this.currentTime;
      var timeSinceStart = currentTime - this.startTime;
      this.currentTime += timeElapsed;

      //Don't update if the animation is finished
      if (timeSinceStart < this.begin) {
        return;
      }

      //Calcualte the ratio between start and finish
      var ratio = (timeSinceStart - this.begin) / this.timeToFinish;

      //The ratio should never be greater than 1
      if (ratio > 1) {
        ratio = 1;
      }

      //Update all properties to reflect the current stage of the animation (using lerp)
      var propKeys = Object.keys(this.propsCurrent);
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];

        this.propsCurrent[key] = lerp(this.propsBegin[key], this.propsEnd[key], ratio);
      }

      //If the animation has reached its end, complete it
      if (ratio >= 1 && !this.loop) {
        this.complete = true;
      } else if (ratio >= 1) {
        this.startTime = currentTime;
      }
    }

    //Copy the values calculated by the animation into a given object

  }, {
    key: "copyVals",
    value: function copyVals(obj) {
      var keys = Object.keys(this.propsCurrent);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        obj[key] = this.propsCurrent[key];
      }
    }
  }]);

  return Animation;
}();

;
"use strict";

//Animates a change in size
function ChangeSize(amount, duration) {
  var sizeAnimation = new Animation({
    begin: 0,
    loop: false,
    timeToFinish: duration,
    propsBegin: { size: this.size },
    propsEnd: { size: this.size + amount }
  });
  return sizeAnimation;
};

//Animates a movement
function MoveTo(x, y, duration) {
  var moveAnimation = new Animation({
    begin: 0,
    loop: false,
    timeToFinish: duration,
    propsBegin: { x: this.x, y: this.y },
    propsEnd: { x: x, y: y }
  });
  return moveAnimation;
}

//Animates movement and size change
function MoveAndSize(x, y, size, duration) {
  var mixedAnimation = new Animation({
    begin: 0,
    loop: false,
    timeToFinish: duration,
    propsBegin: { x: this.x, y: this.y, size: this.size },
    propsEnd: { x: x, y: y, size: size }
  });
  return mixedAnimation;
}

//Animate an image to expand
function ChangeRect(width, height, duration) {
  var expandAnimation = new Animation({
    begin: 0,
    loop: false,
    timeToFinish: duration,
    propsBegin: { width: this.width, height: this.height },
    propsEnd: { width: width, height: height }
  });
  return expandAnimation;
};

//Animate something to rotate
function Rotate(speed) {
  var newAngle = (this.radians + Math.PI) % (Math.PI * 2);
  var rotateAnimation = new Animation({
    begin: 0,
    loop: true,
    timeToFinish: speed,
    propsBegin: { radians: this.radians },
    propsEnd: { radians: newAngle }
  });
  return rotateAnimation;
};

//Animate a small rotation forward
function WobbleForward(amount, speed) {
  var newAngle = this.radians + amount;
  var rotateAnimation = new Animation({
    begin: 0,
    loop: false,
    timeToFinish: speed,
    propsBegin: { radians: this.radians },
    propsEnd: { radians: newAngle }
  });
  return rotateAnimation;
};

//Animate a small rotate backwards
function WobbleBack(amount, speed) {
  var newAngle = this.radians - amount;
  var rotateAnimation = new Animation({
    begin: 0,
    loop: false,
    timeToFinish: speed,
    propsBegin: { radians: this.radians },
    propsEnd: { radians: newAngle }
  });
  return rotateAnimation;
};
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
    }
  }]);

  return Asteroid;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//The animatable class bundles an object's info into a single object for rendering
var Animatable = function () {
  function Animatable(location, properties) {
    _classCallCheck(this, Animatable);

    this.x = location.x;
    this.y = location.y;

    //Set the animatable's properties
    var propKeys = Object.keys(properties);
    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      this[key] = properties[key];
    }

    this.color = "#000000";
    this.radians = 0;
    this.animation = null;
    this.animCallback = null;
    this.opacity = 1;
  }

  _createClass(Animatable, [{
    key: "bindAnimation",


    //Animations can be bound to an animatable, in which case the object will animate when updated
    value: function bindAnimation(Animation, args, callback) {

      //Start the animation at the time of bind
      this.animation = Animation.apply(this, args);
      this.animation.bind(new Date().getTime());

      //If the animation comes with a callback, set the callback
      if (callback) {
        this.animCallback = callback;
      } else {
        this.animCallback = null;
      }
    }
  }, {
    key: "cancelAnimation",


    //Cancel an animatable's animation
    value: function cancelAnimation() {
      delete this.animation;
      this.animation = null;
    }
  }, {
    key: "endAnimation",


    //End the animatable's animation (same as cancel, but calls the animation callback)
    value: function endAnimation() {
      this.cancelAnimation();
      if (this.animCallback) {
        this.animCallback(this);
      }
    }
  }, {
    key: "readyToAnimate",


    //Determine if the animatable is ready to animate
    value: function readyToAnimate() {
      return this.animation === null;
    }
  }, {
    key: "flipImage",


    //Visually flip the animatable
    value: function flipImage() {
      this.radians = (this.radians + Math.PI) % (2 * Math.PI);
    }

    //Update the animatable based on its current animation

  }, {
    key: "update",
    value: function update(currentTime) {
      if (this.animation) {
        //Update the animation and copy over the new values
        this.animation.update(currentTime);
        this.animation.copyVals(this);

        if (this.animation.complete) {
          this.endAnimation();
        }

        return true;
      }
      return this.animation !== null;
    }
  }]);

  return Animatable;
}();

//The circle class extends the animatable class
//Every circle has a size attribute


var Circle = function (_Animatable) {
  _inherits(Circle, _Animatable);

  function Circle(location, size) {
    _classCallCheck(this, Circle);

    return _possibleConstructorReturn(this, (Circle.__proto__ || Object.getPrototypeOf(Circle)).call(this, location, { size: size }));
  }

  //Method to draw a circle


  _createClass(Circle, [{
    key: "draw",
    value: function draw(context) {
      context.fillStyle = this.color;

      var time = new Date().getTime();
      this.update(time);

      context.beginPath();
      context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      context.fill();
    }
  }]);

  return Circle;
}(Animatable);

;

//The graphic class is basically an image with some extra code added on for drawing

var Graphic = function (_Animatable2) {
  _inherits(Graphic, _Animatable2);

  function Graphic(location, image, width, height) {
    _classCallCheck(this, Graphic);

    return _possibleConstructorReturn(this, (Graphic.__proto__ || Object.getPrototypeOf(Graphic)).call(this, location, { image: image, width: width, height: height }));
  }

  //Method to draw image


  _createClass(Graphic, [{
    key: "draw",
    value: function draw(context) {
      var time = new Date().getTime();
      this.update(time);

      context.save();
      var x = -this.width / 2;
      var y = -this.height / 2;
      context.translate(this.x, this.y);
      context.rotate(this.radians);
      context.drawImage(this.image, x, y, this.width, this.height);
      context.restore();
    }
  }]);

  return Graphic;
}(Animatable);

;

//The text class draws handles drawing text

var Text = function (_Animatable3) {
  _inherits(Text, _Animatable3);

  function Text(location, text, font, size) {
    _classCallCheck(this, Text);

    return _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, location, { text: text, font: font, size: size }));
  }

  //Method to draw text


  _createClass(Text, [{
    key: "draw",
    value: function draw(context) {
      var time = new Date().getTime();
      this.update(time);

      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = this.size + "pt " + this.font;
      context.fillStyle = this.color;
      context.fillText(this.text, this.x, this.y);
    }
  }]);

  return Text;
}(Animatable);

;

//Similar to the Circle class, but draws a rectangle

var Rectangle = function (_Animatable4) {
  _inherits(Rectangle, _Animatable4);

  function Rectangle(location, width, height) {
    _classCallCheck(this, Rectangle);

    return _possibleConstructorReturn(this, (Rectangle.__proto__ || Object.getPrototypeOf(Rectangle)).call(this, location, { width: width, height: height }));
  }

  //Method to draw the rectangle


  _createClass(Rectangle, [{
    key: "draw",
    value: function draw(context) {
      var time = new Date().getTime();
      this.update(time);

      context.fillStyle = this.color;
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }]);

  return Rectangle;
}(Animatable);

;
"use strict";

var effectCircles = [];

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
var displayFrame = function displayFrame(cvs, context) {

  //If the display canvas doesn't exist, don't draw to it
  if (!cvs) {
    return;
  }

  //Clear the display canvas, draw from the prep canvas
  clearCanvas(cvs, context);
  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(prepCanvas, 0, 0, prepCanvas.width, prepCanvas.height, 0, 0, cvs.width, cvs.height);
  context.restore();
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

//Draws a player's pick on screen
var drawPick = function drawPick(context, ply) {

  if (!ply.pick) {
    return;
  }

  context.save();

  context.drawImage(ply.pick, ply.x, ply.y, pickIcon.width, pickIcon.height);

  context.restore();
};

//Draws and updates effect circles
var drawAndUpdateEffectCircles = function drawAndUpdateEffectCircles(context) {
  context.save();

  //Iterate over each effect circle and update / draw
  for (var i = 0; i < effectCircles.length; i++) {
    var circle = effectCircles[i];

    context.strokeStyle = "rgb(" + circle.r + ", " + circle.g + ", " + circle.b + ")";
    context.lineWidth = circle.lineWidth;
    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    context.stroke();

    circle.radius += circle.speed;
    circle.lineWidth -= 0.3;

    if (circle.lineWidth <= 0) {
      effectCircles.splice(i, 1);
      i--;
    }
  }

  context.restore();
};

//Call to draw and update gems if there are any
var drawAndUpdateGems = function drawAndUpdateGems(cvs, context) {
  //Iterate over each gem
  for (var i = 0; i < gems.length; i++) {
    var gem = gems[i];

    //Update the gem's position
    gem.x += gem.vector.x;
    gem.y += gem.vector.y;

    //Slow the gem down
    gem.vector = {
      x: gem.vector.x * 0.98,
      y: gem.vector.y * 0.98
    };

    //Rotate the gem
    gem.displayAngle += gem.angleSpeed;

    //Keep the gem within the bounds of the canvas
    if (gem.x < 50) {
      gem.vector.x *= -1;
      gem.x = 50;
    } else if (gem.x > cvs.width - 50) {
      gem.vector.x *= -1;
      gem.x = cvs.width - 50;
    }

    if (gem.y < 50) {
      gem.vector.y *= -1;
      gem.y = 50;
    } else if (gem.y > cvs.height - 50) {
      gem.vector.y *= -1;
      gem.y = cvs.height - 50;
    }

    //Draw the gem
    context.save();
    context.translate(gem.x - 25, gem.y - 25);
    context.rotate(gem.displayAngle);
    context.drawImage(gem.image, 0, 0, gem.image.width, gem.image.height, -25, -25, 50, 50);
    context.restore();
  }
};

//The main call to draw everything to the prep canvas
var draw = function draw() {

  //Clear the prep canvas
  clearCanvas(prepCanvas, prepCtx);

  //Draw stuff to the prep canvas

  prepCtx.filter = "hue-rotate(" + player.color + "deg)";

  //If the background image has loaded, draw it to the background of the prep canvas
  if (galaxyBg) {
    prepCtx.drawImage(galaxyBg, 0, 0, prepCanvas.width, prepCanvas.height);
  }

  //Draw and update the asteroid
  drawAndUpdateAsteroid();

  //Draw and update gems
  drawAndUpdateGems(prepCanvas, prepCtx);

  //Draw all players' picks
  drawPick(prepCtx, player);
  var playerKeys = Object.keys(players);
  for (var i = 0; i < playerKeys.length; i++) {
    drawPick(prepCtx, players[playerKeys[i]]);
  }

  //Draw and update player effect circles
  drawAndUpdateEffectCircles(prepCtx);

  //Draw the prep canvas to the resized frame of the display canvas
  displayFrame(canvas, ctx);
};

//The main call to draw ad related content to the ad canvas
var drawAd = function drawAd() {

  //Clear the prep canvas
  clearCanvas(prepCanvas, prepCtx);

  prepCtx.save();
  prepCtx.fillStyle = "salmon";
  prepCtx.fillRect(0, 0, prepCanvas.width, prepCanvas.height);

  //const adTime = adAudio.currentTime / adAudio.duration;
  var adTime = adAudio.currentTime * 1000;

  while (adTimeline.length > 0 && adTime >= adTimeline[0].trigger) {
    processNextAdEvent();
  }

  var adComponentKeys = Object.keys(adComponents);
  for (var i = 0; i < adComponentKeys.length; i++) {
    var key = adComponentKeys[i];
    adComponents[key].draw(prepCtx);
  }

  prepCtx.restore();

  //Draw to the ad canvas
  displayFrame(adCanvas, adCtx);
};
"use strict";

//Canvas variables
var canvas = void 0,
    ctx = void 0,
    prepCanvas = void 0,
    prepCtx = void 0;
var adCanvas = void 0,
    adCtx = void 0;
var aspectRatio = 16 / 9;
var percentageOfScreenWidth = 0.45;

//Variables to handle ads
var adTimeline = [];
var adComponents = {};
var showingAd = false;
var adAudio = void 0;

//Static image files
var pickIcon = void 0;
var rubbleIcon = void 0;
var galaxyBg = void 0;
var gbIcon = void 0;
var ironIcon = void 0;
var copperIcon = void 0;
var sapphireIcon = void 0;
var emeraldIcon = void 0;
var rubyIcon = void 0;
var diamondIcon = void 0;

//Variables to manage socket
var socket = void 0,
    hash = void 0;
var account = {
  bank: {
    gb: 0,
    iron: 0,
    copper: 0,
    sapphire: 0,
    emerald: 0,
    ruby: 0,
    diamond: 0
  }
};

//Variables to handle update calls
var animationFrame = void 0;

//Variables relating to gamestate
var asteroid = void 0;
var gems = [];
var player = {
  x: -200,
  y: -200,
  color: { r: 0, g: 0, b: 0 }
};
var players = {};
var subContract = void 0;
var mousePos = { x: -200, y: -200 };

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
  } else if (showingAd) {
    renderAd(true);
  }
};

//Load the requested React view
var loadView = function loadView() {
  //Find the page's hash
  var hash = window.location.hash;
  pageView = hash;

  //Render my contracts panel
  renderMyContractsPanel();

  //Render progress / info panel
  if (asteroid) {
    renderProgressPanel(asteroid.progress, asteroid.toughness);
  } else {
    renderProgressPanel();
  }

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
    case "#market":
      {
        renderMarket();
        break;
      }
    case "#upgrades":
      {
        renderUpgrades();
        break;
      }
    case "#highscores":
      {
        renderHighscores();
        break;
      }
    case "#galaxy":
      {
        renderPayToWin();
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

  //Update this every so often (can't be done via sockets, as the panel
  //reaches into various contracts (different game rooms)
  setInterval(function () {
    renderMyContractsPanel();
    //socket.emit('getMyBankData');
  }, 2000);

  //Grab static images included in client page download
  //e.g. variable = document.querySelector("#imageId");
  rubbleIcon = document.querySelector("#rubbleIcon");
  galaxyBg = document.querySelector("#galaxyBg");
  gbIcon = document.querySelector("#gbIcon");
  ironIcon = document.querySelector("#ironIcon");
  copperIcon = document.querySelector("#copperIcon");
  sapphireIcon = document.querySelector("#sapphireIcon");
  emeraldIcon = document.querySelector("#emeraldIcon");
  rubyIcon = document.querySelector("#rubyIcon");
  diamondIcon = document.querySelector("#diamondIcon");
  pickIcon = document.querySelector("#pickIcon");

  //Load the requested view
  loadView();

  //Construct prep canvas (for building frames)
  prepCanvas = document.createElement('canvas');
  prepCanvas.width = 1920;
  prepCanvas.height = 1080;
  prepCtx = prepCanvas.getContext('2d');

  //Connect to the server via socket.io
  socket = io.connect();

  //Attach custom socket events
  //socket.on('event', eventFunc);
  socket.on('playerInfo', setupPlayer);
  socket.on('playerUpdate', updatePlayer);
  socket.on('playerLeave', removePlayer);
  socket.on('spawnAsteroid', spawnAsteroid);
  socket.on('click', processPlayerClick);
  socket.on('asteroidUpdate', updateAsteroid);
  socket.on('subContractUpdate', updateSubContract);
  socket.on('finishAsteroid', finishAsteroid);
  socket.on('cancelSubContract', cancelSubContract);
  socket.on('finishSubContract', finishSubContract);
  socket.on('noSub', stopSub);
  socket.on('accountUpdate', updateAccount);
  socket.on('successMessage', processSocketSuccess);
  socket.on('errorMessage', processSocketError);

  //Load the player's bank data
  socket.emit('getMyBankData');

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

//Constructs a window for purchasing / agreeing to contracts
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
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "h2",
        null,
        "Standard Contracts"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "100% of the profits go to you upon completely mining the asteroid."
      ),
      React.createElement("div", { id: "basicContracts" }),
      React.createElement("hr", null),
      React.createElement(
        "h2",
        null,
        "Partner Contracts"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Partner contracts are split into 25% shares (4 shares per asteroid) on purchase, one immediately belonging to the original buyer. Costs and profits are split evenly between the owner and all partners. If you wish to claim additional shares, accept the partner contract multiple times"
      ),
      React.createElement("div", { id: "partnerContracts" }),
      React.createElement("hr", null),
      React.createElement(
        "h2",
        null,
        "Sub Contracts"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "You will be paid the specified amount once you deliver the required number of clicks."
      ),
      React.createElement("div", { id: "subContracts" })
    )
  );
};

//Helper function to start mining for a sub contract
var startSubMine = function startSubMine(e) {
  var subContractId = e.target.getAttribute("data-contract-id");

  if (!subContractId) {
    return;
  }

  window.location = "#miner";
  socket.emit('mineSub', { subContractId: subContractId });
};

//Helper function to start mining
var startMine = function startMine(e) {
  var contractId = e.target.getAttribute("data-contract-id");

  if (!contractId) {
    return;
  }

  window.location.hash = "#miner";
  socket.emit('mine', { contractId: contractId });
};

var startPartnerMine = function startPartnerMine(e) {
  var partnerContractId = e.target.getAttribute("data-contract-id");

  if (!partnerContractId) {
    return;
  }

  window.location.hash = "#miner";
  socket.emit('minePartner', { partnerContractId: partnerContractId });
};

//Constructs a window displaying the user's contracts
var MyContractsWindow = function MyContractsWindow(props) {
  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        null,
        "My Contracts"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Contracts you own"
      ),
      React.createElement("div", { id: "myContracts" }),
      React.createElement("hr", null),
      React.createElement(
        "h1",
        null,
        "Sub Contracts"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Monitor your sub contracts"
      ),
      React.createElement(
        "div",
        null,
        React.createElement(
          "button",
          { onClick: renderSubContractModal,
            className: "btn btn-lg btn-primary fullButton" },
          "Draft Sub Contract"
        )
      ),
      React.createElement("hr", null),
      React.createElement("div", { id: "mySubContracts" })
    )
  );
};

//Helper method to buy a standard contract
var purchaseContract = function purchaseContract(e) {
  var asteroidClass = e.target.getAttribute('data-purchase');

  if (!asteroidClass) {
    return;
  }

  getTokenWithCallback(function (csrfToken) {
    var data = "ac=" + asteroidClass + "&_csrf=" + csrfToken;
    sendAjax('POST', '/buyAsteroid', data, function (data) {
      handleSuccess(data.message);
      renderContracts();
    });
  });
};

var joinContractAsPartner = function joinContractAsPartner(e) {
  var contractId = e.target.getAttribute('data-contractId');

  if (!contractId) {
    return;
  }

  getTokenWithCallback(function (csrfToken) {
    var data = "id=" + contractId + "&_csrf=" + csrfToken;
    sendAjax('POST', '/joinContractAsPartner', data, function (data) {
      handleSuccess(data.message);
      renderContracts();
    });
  });
};

//Helper method to accept a sub contract
var acceptSubContract = function acceptSubContract(e) {
  var subContractId = e.target.getAttribute('data-accept');

  if (!subContractId) {
    return;
  }

  getTokenWithCallback(function (csrfToken) {
    var data = "id=" + subContractId + "&_csrf=" + csrfToken;
    sendAjax('POST', '/acceptSubContract', data, function (data) {
      handleSuccess(data.message);
      renderContracts();
    });
  });
};

//Handle a request to create a sub contract
var handleSubContractSubmit = function handleSubContractSubmit(e) {

  if (e) {
    e.preventDefault();
  }

  var clickNum = document.querySelector("#clickNum");

  if (clickNum.value < 1) {
    handleError("Number of clicks must be at least 1");
    return false;
  }

  sendAjax('POST', $("#subContractForm").attr("action"), $("#subContractForm").serialize(), function (data) {
    hideModal();
    handleSuccess(data.message);
    socket.emit('getMyBankData');
    renderMyContractsPanel();
  });

  return false;
};

//Handle a request to sell resources for Galaxy Bucks
var handleMarketSubmit = function handleMarketSubmit(e) {
  e.preventDefault();

  sendAjax('POST', $("#marketForm").attr("action"), $("#marketForm").serialize(), function (data) {
    handleSuccess(data.message);
    socket.emit('getMyBankData');
    loadView();
  });

  return false;
};

// Handles a request to buy an upgrade
var handlePurchase = function handlePurchase(power) {
  sendAjax('POST', $("#upgradeForm" + power).attr("action"), $("#upgradeForm" + power).serialize(), function (data) {
    handleSuccess(data.message);
    socket.emit('getMyBankData');
    loadView();
  });
  return false;
};

// Buy a contract as a partner one
var purchaseAsPartnerContract = function purchaseAsPartnerContract(e) {
  var asteroidClass = e.target.getAttribute('data-purchase');

  if (!asteroidClass) {
    return;
  }

  getTokenWithCallback(function (csrfToken) {
    var data = "ac=" + asteroidClass + "&_csrf=" + csrfToken;
    sendAjax('POST', '/buyPartnerAsteroid', data, function (data) {
      handleSuccess(data.message);
      renderContracts();
    });
  });
};

//Builds a list of owned sub contracts
var MySubContracts = function MySubContracts(props) {
  var subContracts = props.data.map(function (contract, index) {
    return React.createElement(
      "li",
      { className: "list-group-item d-flex" },
      React.createElement(
        "div",
        { className: "card border-info mb-3 contractCard" },
        React.createElement(
          "div",
          { className: "card-header justify-content-center" },
          "Asteroid Class: ",
          contract.asteroid.classname.toUpperCase(),
          React.createElement(
            "div",
            { className: "vAlign pillContainer" },
            React.createElement(
              "span",
              { className: "badge badge-info badge-pill" },
              "#",
              index + 1
            )
          )
        ),
        React.createElement(
          "div",
          { className: "card-body" },
          React.createElement(
            "div",
            { className: "container" },
            React.createElement(
              "div",
              { className: "row" },
              React.createElement(
                "div",
                { className: "col-sm-12 text-center" },
                React.createElement(
                  "p",
                  { className: "card-text" },
                  "Contract Progress: ",
                  contract.progress,
                  " / ",
                  contract.clicks
                )
              )
            )
          )
        )
      )
    );
  });

  return React.createElement(
    "ul",
    { className: "list-group" },
    subContracts
  );
};

//Builds a list of contracts that the user owns
var MyContracts = function MyContracts(props) {
  var subContracts = props.data.subContracts.map(function (contract, index) {
    return React.createElement(
      "li",
      { className: "list-group-item d-flex" },
      React.createElement(
        "div",
        { className: "card border-info mb-3 contractCard" },
        React.createElement(
          "div",
          { className: "card-header justify-content-center" },
          "Asteroid Class: ",
          contract.asteroid.classname.toUpperCase(),
          React.createElement(
            "div",
            { className: "vAlign pillContainer" },
            React.createElement(
              "span",
              { className: "badge badge-info badge-pill" },
              "#",
              index + 1
            )
          )
        ),
        React.createElement(
          "div",
          { className: "card-body" },
          React.createElement(
            "div",
            { className: "container" },
            React.createElement(
              "div",
              { className: "row" },
              React.createElement(
                "div",
                { className: "col-sm-12 text-center" },
                React.createElement(
                  "p",
                  { className: "card-text" },
                  "Contract Progress: ",
                  contract.progress,
                  " / ",
                  contract.clicks
                ),
                React.createElement(
                  "button",
                  { "data-contract-id": contract.subContractId, onClick: startSubMine,
                    className: "btn btn-lg btn-info fullButton" },
                  "Mine"
                )
              )
            )
          )
        )
      )
    );
  });

  var contracts = props.data.contracts.map(function (contract, index) {
    return React.createElement(
      "li",
      { className: "list-group-item d-flex" },
      React.createElement(
        "div",
        { className: "card border-primary mb-3 contractCard" },
        React.createElement(
          "div",
          { className: "card-header justify-content-center" },
          "Asteroid Class: ",
          contract.asteroid.classname.toUpperCase(),
          React.createElement(
            "div",
            { className: "vAlign pillContainer" },
            React.createElement(
              "span",
              { className: "badge badge-primary badge-pill" },
              "#",
              index + 1
            )
          )
        ),
        React.createElement(
          "div",
          { className: "card-body" },
          React.createElement(
            "div",
            { className: "container" },
            React.createElement(
              "div",
              { className: "row" },
              React.createElement(
                "div",
                { className: "col-sm-12 text-center" },
                React.createElement(
                  "p",
                  { className: "card-text" },
                  "Progress: ",
                  contract.asteroid.progress,
                  " / ",
                  contract.asteroid.toughness
                ),
                React.createElement(
                  "button",
                  { "data-contract-id": contract.contractId, onClick: startMine,
                    className: "btn btn-lg btn-primary fullButton" },
                  "Mine"
                )
              )
            )
          )
        )
      )
    );
  });

  var partnerContracts = props.data.partnerContracts.map(function (contract, index) {
    return React.createElement(
      "li",
      { className: "list-group-item d-flex" },
      React.createElement(
        "div",
        { className: "card border-danger mb-3 contractCard" },
        React.createElement(
          "div",
          { className: "card-header justify-content-center" },
          "Asteroid Class: ",
          contract.asteroid.classname.toUpperCase(),
          React.createElement(
            "div",
            { className: "vAlign pillContainer" },
            React.createElement(
              "span",
              { className: "badge badge-danger badge-pill" },
              "#",
              index + 1
            )
          )
        ),
        React.createElement(
          "div",
          { className: "card-body" },
          React.createElement(
            "div",
            { className: "container" },
            React.createElement(
              "div",
              { className: "row" },
              React.createElement(
                "div",
                { className: "col-sm-12 text-center" },
                React.createElement(
                  "p",
                  { className: "card-text" },
                  "Progress: ",
                  contract.asteroid.progress,
                  " / ",
                  contract.asteroid.toughness
                ),
                React.createElement(
                  "button",
                  { "data-contract-id": contract.partnerContractId, onClick: startPartnerMine,
                    className: "btn btn-lg btn-danger fullButton" },
                  "Mine"
                )
              )
            )
          )
        )
      )
    );
  });

  return React.createElement(
    "ul",
    { className: "list-group" },
    subContracts,
    contracts,
    partnerContracts
  );
};

//Builds a list of basic contracts and ads them to the basic contracts section
var BasicContracts = function BasicContracts(props) {

  //List each basic contract and it's relevant details
  var contractKeys = Object.keys(props.contracts);
  var contracts = [];
  for (var i = 0; i < contractKeys.length; i++) {
    var contract = props.contracts[contractKeys[i]];

    var rewardKeys = Object.keys(contract.rewardChances);
    var rewards = [];
    for (var _i = 0; _i < rewardKeys.length; _i++) {
      var reward = contract.rewardChances[rewardKeys[_i]];
      rewards.push(React.createElement(
        "li",
        { className: "card-text" },
        rewardKeys[_i],
        ": ",
        reward.min,
        "-",
        reward.max
      ));
    }

    contracts.push(React.createElement(
      "li",
      { className: "list-group-item d-flex" },
      React.createElement(
        "div",
        { className: "card border-primary mb-3 contractCard" },
        React.createElement(
          "div",
          { className: "card-header justify-content-center" },
          contract.name,
          React.createElement(
            "div",
            { className: "vAlign pillContainer" },
            React.createElement(
              "span",
              { className: "badge badge-primary badge-pill" },
              "#",
              i + 1
            )
          )
        ),
        React.createElement(
          "div",
          { className: "card-body" },
          React.createElement(
            "div",
            { className: "container" },
            React.createElement(
              "div",
              { className: "row" },
              React.createElement(
                "div",
                { className: "col-sm-4 text-center" },
                React.createElement(
                  "p",
                  { className: "card-text" },
                  "Price: ",
                  contract.price,
                  " Galaxy Bucks"
                ),
                React.createElement(
                  "p",
                  { className: "card-text" },
                  "Toughness: ",
                  contract.toughness,
                  " Clicks"
                ),
                React.createElement("img", { className: "imagePreview", src: "/assets/img/asteroids/" + contract.asteroidClass + "01.png", alt: "Asteroid Sample" })
              ),
              React.createElement(
                "div",
                { className: "col-sm-4" },
                React.createElement(
                  "p",
                  { className: "card-text" },
                  "Potential Rewards:",
                  React.createElement(
                    "ul",
                    null,
                    rewards
                  )
                )
              ),
              React.createElement(
                "div",
                { className: "col-sm-4 text-center justify-content-center vAlign" },
                React.createElement(
                  "p",
                  { className: "contractButtonContainer" },
                  React.createElement(
                    "button",
                    { "data-purchase": contract.asteroidClass, onClick: purchaseContract,
                      className: "btn btn-lg btn-primary normalWhitespace" },
                    "Purchase Asteroid (",
                    contract.price,
                    " GB)"
                  ),
                  React.createElement(
                    "button",
                    { "data-purchase": contract.asteroidClass, onClick: purchaseAsPartnerContract,
                      className: "btn btn-lg btn-primary normalWhitespace" },
                    "Purchase As Partner (",
                    contract.price / 4,
                    " GB)"
                  )
                )
              )
            )
          )
        )
      )
    ));
  }

  return React.createElement(
    "div",
    { id: "basicContractList" },
    React.createElement(
      "ul",
      { className: "list-group" },
      contracts
    )
  );
};

//Construct a list of partner contracts
var PartnerContracts = function PartnerContracts(props) {
  var openContracts = props.contracts;
  var contracts = [];

  for (var i = 0; i < openContracts.length; i++) {
    var contract = openContracts[i];

    contracts.push(React.createElement(
      "li",
      { className: "list-group-item d-flex" },
      React.createElement(
        "div",
        { className: "card border-danger mb-3 contractCard" },
        React.createElement(
          "div",
          { className: "card-header justify-content-center" },
          "Asteroid Class: ",
          contract.asteroid.classname.toUpperCase()
        ),
        React.createElement(
          "div",
          { className: "card-body" },
          React.createElement(
            "div",
            { className: "container" },
            React.createElement(
              "div",
              { className: "row" },
              React.createElement(
                "div",
                { className: "col-sm-4 text-center" },
                React.createElement(
                  "p",
                  { className: "card-text" },
                  "Slots: ",
                  contract.partners.length,
                  " / ",
                  contract.maximumPartners
                ),
                React.createElement(
                  "p",
                  { className: "card-text" },
                  "Toughness: ",
                  contract.asteroid.toughness,
                  " Clicks"
                ),
                React.createElement("img", { className: "imagePreview", src: "" + contract.asteroid.imageFile, alt: "Asteroid Sample" })
              ),
              React.createElement(
                "div",
                { className: "col-sm-4 text-center justify-content-center vAlign" },
                React.createElement(
                  "p",
                  { className: "contractButtonContainer" },
                  React.createElement(
                    "button",
                    { "data-contractID": contract._id, onClick: joinContractAsPartner,
                      className: "btn btn-lg btn-danger normalWhitespace" },
                    "Join as Partner (",
                    contract.price,
                    " GB)"
                  )
                )
              )
            )
          )
        )
      )
    ));
  }

  return React.createElement(
    "div",
    { id: "basicContractList" },
    React.createElement(
      "ul",
      { className: "list-group" },
      contracts
    )
  );
};

//Construct a list of sub contracts
var SubContracts = function SubContracts(props) {

  var contractKeys = Object.keys(props.contracts);
  var contracts = [];
  for (var i = 0; i < contractKeys.length; i++) {
    var contract = props.contracts[contractKeys[i]];

    var rewardKeys = Object.keys(contract.rewards);
    var rewards = [];
    for (var _i2 = 0; _i2 < rewardKeys.length; _i2++) {
      var reward = contract.rewards[rewardKeys[_i2]];
      rewards.push(React.createElement(
        "li",
        { className: "card-text" },
        rewardKeys[_i2],
        ": ",
        contract.rewards[rewardKeys[_i2]]
      ));
    }

    contracts.push(React.createElement(
      "li",
      { className: "list-group-item d-flex" },
      React.createElement(
        "div",
        { className: "card border-info mb-3 contractCard" },
        React.createElement(
          "div",
          { className: "card-header justify-content-center" },
          contract.name,
          React.createElement(
            "div",
            { className: "vAlign pillContainer" },
            React.createElement(
              "span",
              { className: "badge badge-info badge-pill" },
              "#",
              i + 1
            )
          )
        ),
        React.createElement(
          "div",
          { className: "card-body" },
          React.createElement(
            "div",
            { className: "container" },
            React.createElement(
              "div",
              { className: "row" },
              React.createElement(
                "div",
                { className: "col-sm-4 text-center" },
                React.createElement(
                  "p",
                  { className: "card-text" },
                  "Contractor: ",
                  contract.owner
                ),
                React.createElement(
                  "p",
                  { className: "card-text" },
                  "Required: ",
                  contract.clicks,
                  " Clicks"
                ),
                React.createElement("img", { className: "imagePreview", src: "/assets/img/asteroids/" + contract.asteroidClass + "01.png", alt: "Asteroid Sample" })
              ),
              React.createElement(
                "div",
                { className: "col-sm-4" },
                React.createElement(
                  "p",
                  { className: "card-text" },
                  "Rewards:",
                  React.createElement(
                    "ul",
                    null,
                    rewards
                  )
                )
              ),
              React.createElement(
                "div",
                { className: "col-sm-4 text-center justify-content-center vAlign" },
                React.createElement(
                  "p",
                  { className: "contractButtonContainer" },
                  React.createElement(
                    "button",
                    { "data-accept": contract.subContractId, onClick: acceptSubContract,
                      className: "btn btn-lg btn-info normalWhitespace" },
                    "Accept Sub Contract"
                  )
                )
              )
            )
          )
        )
      )
    ));
  }

  return React.createElement(
    "div",
    { id: "basicContractList" },
    React.createElement(
      "ul",
      { className: "list-group" },
      contracts
    )
  );
};

//Helper function that returns a compact version of the requested number
var compressNumber = function compressNumber(num) {
  if (num > 1000000000000) {
    num = Math.floor(num / 1000000000000) + "T";
  } else if (num > 1000000000) {
    num = Math.floor(num / 1000000000) + "B";
  } else if (num > 1000000) {
    num = Math.floor(num / 1000000) + "M";
  }

  if (Number.isNaN(num) || num === undefined) {
    num = 0;
  }

  return num;
};

//Construct a window for selling resources back to the server for Galaxy Bucks
var MarketWindow = function MarketWindow(props) {

  //If the user's bank has not loaded, wait for it to do so
  if (!account.bank) {
    return React.createElement(
      "div",
      { className: "container" },
      React.createElement(
        "div",
        { className: "jumbotron" },
        React.createElement(
          "p",
          { className: "lead" },
          "Loading account data... ",
          React.createElement("span", { className: "fas fa-sync fa-spin" })
        )
      )
    );
  }

  //Grab current input values to calculate potential pay
  var currentInputs = document.querySelectorAll("#marketForm input[type=number]");
  var currentValues = {};
  for (var i = 0; i < currentInputs.length; i++) {
    var input = currentInputs[i];
    currentValues[input.name] = parseInt(input.value, 10);

    //Make sure the entered value is a number
    if (Number.isNaN(currentValues[input.name])) {
      currentValues[input.name] = 0;
    }
  }

  //Calculate the total pay
  var totalPay = compressNumber(props.rates.iron * currentValues.iron + props.rates.copper * currentValues.copper + props.rates.sapphire * currentValues.sapphire + props.rates.emerald * currentValues.emerald + props.rates.ruby * currentValues.ruby + props.rates.diamond * currentValues.diamond);

  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        { className: "display-3" },
        "Sell Resources:"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "In need of some Galaxy Bucks? Sell your hard-earned loot!"
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "form",
        { id: "marketForm", className: "form", onSubmit: handleMarketSubmit,
          action: "/sellResources"
        },
        React.createElement(
          "div",
          { className: "row justify-content-center" },
          React.createElement(
            "div",
            { className: "col-sm-4 text-center" },
            React.createElement(
              "p",
              { className: "lead" },
              "Resources"
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-4 text-center" },
            React.createElement(
              "p",
              { className: "lead" },
              "Amount to Sell"
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center" },
            React.createElement(
              "p",
              { className: "lead" },
              "Price Per (RCCTR*)"
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center" },
            React.createElement(
              "p",
              { className: "lead" },
              "Payment"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "row justify-content-center" },
          React.createElement(
            "div",
            { className: "col-sm-4 text-center flex-center border border-primary" },
            React.createElement(
              "label",
              { className: "form-input-label" },
              React.createElement("img", { src: ironIcon.src, width: "25", height: "25", alt: "" }),
              " Iron: (",
              account.bank.iron,
              ")"
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-4 flex-center" },
            React.createElement("input", { name: "iron", className: "form-control", type: "number", min: "0", max: account.bank.iron })
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-info flex-center" },
              React.createElement(
                "span",
                null,
                props.rates.iron,
                "x"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-success flex-center" },
              React.createElement(
                "span",
                null,
                compressNumber(props.rates.iron * currentValues.iron),
                " GB"
              )
            )
          )
        ),
        React.createElement("hr", null),
        React.createElement(
          "div",
          { className: "row justify-content-center" },
          React.createElement(
            "div",
            { className: "col-sm-4 text-center flex-center border border-primary" },
            React.createElement(
              "label",
              { className: "form-input-label" },
              React.createElement("img", { src: copperIcon.src, width: "25", height: "25", alt: "" }),
              " Copper: (",
              account.bank.copper,
              ")"
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-4" },
            React.createElement("input", { name: "copper", className: "form-control", type: "number", min: "0", max: account.bank.copper })
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-info flex-center" },
              React.createElement(
                "span",
                null,
                props.rates.copper,
                "x"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-success flex-center" },
              React.createElement(
                "span",
                null,
                compressNumber(props.rates.copper * currentValues.copper),
                " GB"
              )
            )
          )
        ),
        React.createElement("hr", null),
        React.createElement(
          "div",
          { className: "row justify-content-center" },
          React.createElement(
            "div",
            { className: "col-sm-4 text-center flex-center border border-primary" },
            React.createElement(
              "label",
              { className: "form-input-label" },
              React.createElement("img", { src: sapphireIcon.src, width: "25", height: "25", alt: "" }),
              " Sapphires: (",
              account.bank.sapphire,
              ")"
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-4" },
            React.createElement("input", { name: "sapphire", className: "form-control", type: "number", min: "0", max: account.bank.sapphire })
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-info flex-center" },
              React.createElement(
                "span",
                null,
                props.rates.sapphire,
                "x"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-success flex-center" },
              React.createElement(
                "span",
                null,
                compressNumber(props.rates.sapphire * currentValues.sapphire),
                " GB"
              )
            )
          )
        ),
        React.createElement("hr", null),
        React.createElement(
          "div",
          { className: "row justify-content-center" },
          React.createElement(
            "div",
            { className: "col-sm-4 text-center flex-center border border-primary" },
            React.createElement(
              "label",
              { className: "form-input-label" },
              React.createElement("img", { src: emeraldIcon.src, width: "25", height: "25", alt: "" }),
              " Emeralds: (",
              account.bank.emerald,
              ")"
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-4" },
            React.createElement("input", { name: "emerald", className: "form-control", type: "number", min: "0", max: account.bank.emerald })
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-info flex-center" },
              React.createElement(
                "span",
                null,
                props.rates.emerald,
                "x"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-success flex-center" },
              React.createElement(
                "span",
                null,
                compressNumber(props.rates.emerald * currentValues.emerald),
                " GB"
              )
            )
          )
        ),
        React.createElement("hr", null),
        React.createElement(
          "div",
          { className: "row justify-content-center" },
          React.createElement(
            "div",
            { className: "col-sm-4 text-center flex-center border border-primary" },
            React.createElement(
              "label",
              { className: "form-input-label" },
              React.createElement("img", { src: rubyIcon.src, width: "25", height: "25", alt: "" }),
              " Rubies: (",
              account.bank.ruby,
              ")"
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-4" },
            React.createElement("input", { name: "ruby", className: "form-control", type: "number", min: "0", max: account.bank.ruby })
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-info flex-center" },
              React.createElement(
                "span",
                null,
                props.rates.ruby,
                "x"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-success flex-center" },
              React.createElement(
                "span",
                null,
                compressNumber(props.rates.ruby * currentValues.ruby),
                " GB"
              )
            )
          )
        ),
        React.createElement("hr", null),
        React.createElement(
          "div",
          { className: "row justify-content-center" },
          React.createElement(
            "div",
            { className: "col-sm-4 text-center flex-center border border-primary" },
            React.createElement(
              "label",
              { className: "form-input-label" },
              React.createElement("img", { src: diamondIcon.src, width: "25", height: "25", alt: "" }),
              " Diamonds: (",
              account.bank.diamond,
              ")"
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-4" },
            React.createElement("input", { name: "diamond", className: "form-control", type: "number", min: "0", max: account.bank.diamond })
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-info flex-center" },
              React.createElement(
                "span",
                null,
                props.rates.diamond,
                "x"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-success flex-center" },
              React.createElement(
                "span",
                null,
                compressNumber(props.rates.diamond * currentValues.diamond),
                " GB"
              )
            )
          )
        ),
        React.createElement("hr", null),
        React.createElement(
          "div",
          { className: "row justify-content-center" },
          React.createElement(
            "div",
            { className: "col-sm-4 text-center flex-center" },
            React.createElement(
              "p",
              null,
              "->"
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-4 text-center" },
            React.createElement(
              "p",
              null,
              "->"
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "p",
              null,
              "->"
            )
          ),
          React.createElement(
            "div",
            { className: "col-sm-2 text-center flex-center" },
            React.createElement(
              "div",
              { className: "full-size border border-success flex-center" },
              React.createElement(
                "span",
                null,
                compressNumber(totalPay),
                " GB"
              )
            )
          )
        ),
        React.createElement("input", { className: "hidden", name: "_csrf", value: props.csrf }),
        React.createElement("hr", null),
        React.createElement(
          "div",
          { className: "row justify-content-center" },
          React.createElement("div", { className: "col-sm-8 text-center flex-center" }),
          React.createElement(
            "div",
            { className: "col-sm-4 text-center flex-center" },
            React.createElement("input", { type: "submit", className: "btn btn-lg btn-success", value: "Sell Resources" })
          )
        )
      ),
      React.createElement(
        "p",
        { className: "lead font-italic" },
        "*RCCTR: Robo Corp\xAE Current Trade Rate"
      )
    )
  );
};

//Construct a window to allow the player to purchase upgrades
var UpgradesWindow = function UpgradesWindow(props) {
  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      React.createElement(
        "h1",
        { className: "display-3" },
        "Mining Upgrades:"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Purchase these to make mining easier!"
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "div",
        { className: "row justify-content-center" },
        React.createElement(
          "p",
          null,
          React.createElement("img", { width: "25", height: "25", src: ironIcon.src, alt: "" }),
          " Iron: ",
          account.bank.iron,
          React.createElement("img", { width: "25", height: "25", src: copperIcon.src, alt: "" }),
          " Copper: ",
          account.bank.copper,
          React.createElement("img", { width: "25", height: "25", src: sapphireIcon.src, alt: "" }),
          " Sapphires: ",
          account.bank.sapphire,
          React.createElement("img", { width: "25", height: "25", src: emeraldIcon.src, alt: "" }),
          " Emeralds: ",
          account.bank.emerald,
          React.createElement("img", { width: "25", height: "25", src: rubyIcon.src, alt: "" }),
          " Rubies: ",
          account.bank.ruby,
          React.createElement("img", { width: "25", height: "25", src: diamondIcon.src, alt: "" }),
          " Diamonds: ",
          account.bank.diamond
        )
      ),
      React.createElement(
        "div",
        { className: "row justify-content-center border border-info" },
        React.createElement(
          "div",
          { className: "col-sm-8 text-center" },
          React.createElement(
            "p",
            { className: "lead" },
            "Upgrade by 1 mining power"
          ),
          React.createElement(
            "p",
            null,
            React.createElement("img", { width: "25", height: "25", src: ironIcon.src, alt: "" }),
            ": ",
            250,
            React.createElement("img", { width: "25", height: "25", src: copperIcon.src, alt: "" }),
            ": ",
            20,
            React.createElement("img", { width: "25", height: "25", src: sapphireIcon.src, alt: "" }),
            ": ",
            2,
            React.createElement("img", { width: "25", height: "25", src: emeraldIcon.src, alt: "" }),
            ": ",
            0,
            React.createElement("img", { width: "25", height: "25", src: rubyIcon.src, alt: "" }),
            ": ",
            0,
            React.createElement("img", { width: "25", height: "25", src: diamondIcon.src, alt: "" }),
            ": ",
            0
          )
        ),
        React.createElement(
          "div",
          { className: "col-sm-4 text-center upgrade-button" },
          React.createElement(
            "form",
            { id: "upgradeForm1", onSubmit: function onSubmit(e) {
                e.preventDefault();handlePurchase(1);
              }, name: "handlePurchaseForm", action: "/purchaseUpgrade", method: "POST" },
            React.createElement(
              "fieldset",
              null,
              React.createElement("input", { type: "hidden", name: "power", value: "1" }),
              React.createElement("input", { type: "hidden", name: "iron", value: "250" }),
              React.createElement("input", { type: "hidden", name: "copper", value: "20" }),
              React.createElement("input", { type: "hidden", name: "sapphire", value: "2" }),
              React.createElement("input", { type: "hidden", name: "emerald", value: "0" }),
              React.createElement("input", { type: "hidden", name: "ruby", value: "0" }),
              React.createElement("input", { type: "hidden", name: "diamond", value: "0" }),
              React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
              React.createElement(
                "button",
                { type: "submit", className: "btn btn-success btn-sm btn-block" },
                "Purchase"
              )
            )
          )
        )
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "div",
        { className: "row justify-content-center border border-info" },
        React.createElement(
          "div",
          { className: "col-sm-8 text-center" },
          React.createElement(
            "p",
            { className: "lead" },
            "Upgrade by 5 mining power"
          ),
          React.createElement(
            "p",
            null,
            React.createElement("img", { width: "25", height: "25", src: ironIcon.src, alt: "" }),
            ": ",
            1000,
            React.createElement("img", { width: "25", height: "25", src: copperIcon.src, alt: "" }),
            ": ",
            80,
            React.createElement("img", { width: "25", height: "25", src: sapphireIcon.src, alt: "" }),
            ": ",
            8,
            React.createElement("img", { width: "25", height: "25", src: emeraldIcon.src, alt: "" }),
            ": ",
            0,
            React.createElement("img", { width: "25", height: "25", src: rubyIcon.src, alt: "" }),
            ": ",
            0,
            React.createElement("img", { width: "25", height: "25", src: diamondIcon.src, alt: "" }),
            ": ",
            0
          )
        ),
        React.createElement(
          "div",
          { className: "col-sm-4 text-center upgrade-button" },
          React.createElement(
            "form",
            { id: "upgradeForm5", onSubmit: function onSubmit(e) {
                e.preventDefault();handlePurchase(5);
              }, name: "handlePurchaseForm", action: "/purchaseUpgrade", method: "POST" },
            React.createElement(
              "fieldset",
              null,
              React.createElement("input", { type: "hidden", name: "power", value: "5" }),
              React.createElement("input", { type: "hidden", name: "iron", value: "1000" }),
              React.createElement("input", { type: "hidden", name: "copper", value: "80" }),
              React.createElement("input", { type: "hidden", name: "sapphire", value: "8" }),
              React.createElement("input", { type: "hidden", name: "emerald", value: "" }),
              React.createElement("input", { type: "hidden", name: "ruby", value: "0" }),
              React.createElement("input", { type: "hidden", name: "diamond", value: "0" }),
              React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
              React.createElement(
                "button",
                { type: "submit", className: "btn btn-success btn-sm btn-block" },
                "Purchase"
              )
            )
          )
        )
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "div",
        { className: "row justify-content-center border border-info" },
        React.createElement(
          "div",
          { className: "col-sm-8 text-center" },
          React.createElement(
            "p",
            { className: "lead" },
            "Upgrade by 25 mining power"
          ),
          React.createElement(
            "p",
            null,
            React.createElement("img", { width: "25", height: "25", src: ironIcon.src, alt: "" }),
            ": ",
            4000,
            React.createElement("img", { width: "25", height: "25", src: copperIcon.src, alt: "" }),
            ": ",
            320,
            React.createElement("img", { width: "25", height: "25", src: sapphireIcon.src, alt: "" }),
            ": ",
            24,
            React.createElement("img", { width: "25", height: "25", src: emeraldIcon.src, alt: "" }),
            ": ",
            4,
            React.createElement("img", { width: "25", height: "25", src: rubyIcon.src, alt: "" }),
            ": ",
            0,
            React.createElement("img", { width: "25", height: "25", src: diamondIcon.src, alt: "" }),
            ": ",
            0
          )
        ),
        React.createElement(
          "div",
          { className: "col-sm-4 text-center upgrade-button" },
          React.createElement(
            "form",
            { id: "upgradeForm25", onSubmit: function onSubmit(e) {
                e.preventDefault();handlePurchase(25);
              }, name: "handlePurchaseForm", action: "/purchaseUpgrade", method: "POST" },
            React.createElement(
              "fieldset",
              null,
              React.createElement("input", { type: "hidden", name: "power", value: "25" }),
              React.createElement("input", { type: "hidden", name: "iron", value: "4000" }),
              React.createElement("input", { type: "hidden", name: "copper", value: "320" }),
              React.createElement("input", { type: "hidden", name: "sapphire", value: "24" }),
              React.createElement("input", { type: "hidden", name: "emerald", value: "4" }),
              React.createElement("input", { type: "hidden", name: "ruby", value: "0" }),
              React.createElement("input", { type: "hidden", name: "diamond", value: "0" }),
              React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
              React.createElement(
                "button",
                { type: "submit", className: "btn btn-success btn-sm btn-block" },
                "Purchase"
              )
            )
          )
        )
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "div",
        { className: "row justify-content-center border border-info" },
        React.createElement(
          "div",
          { className: "col-sm-8 text-center" },
          React.createElement(
            "p",
            { className: "lead" },
            "Upgrade by 100 mining power"
          ),
          React.createElement(
            "p",
            null,
            React.createElement("img", { width: "25", height: "25", src: ironIcon.src, alt: "" }),
            ": ",
            12000,
            React.createElement("img", { width: "25", height: "25", src: copperIcon.src, alt: "" }),
            ": ",
            1280,
            React.createElement("img", { width: "25", height: "25", src: sapphireIcon.src, alt: "" }),
            ": ",
            96,
            React.createElement("img", { width: "25", height: "25", src: emeraldIcon.src, alt: "" }),
            ": ",
            16,
            React.createElement("img", { width: "25", height: "25", src: rubyIcon.src, alt: "" }),
            ": ",
            4,
            React.createElement("img", { width: "25", height: "25", src: diamondIcon.src, alt: "" }),
            ": ",
            0
          )
        ),
        React.createElement(
          "div",
          { className: "col-sm-4 text-center upgrade-button" },
          React.createElement(
            "form",
            { id: "upgradeForm100", onSubmit: function onSubmit(e) {
                e.preventDefault();handlePurchase(100);
              }, name: "handlePurchaseForm", action: "/purchaseUpgrade", method: "POST" },
            React.createElement(
              "fieldset",
              null,
              React.createElement("input", { type: "hidden", name: "power", value: "100" }),
              React.createElement("input", { type: "hidden", name: "iron", value: "12000" }),
              React.createElement("input", { type: "hidden", name: "copper", value: "1280" }),
              React.createElement("input", { type: "hidden", name: "sapphire", value: "96" }),
              React.createElement("input", { type: "hidden", name: "emerald", value: "16" }),
              React.createElement("input", { type: "hidden", name: "ruby", value: "4" }),
              React.createElement("input", { type: "hidden", name: "diamond", value: "0" }),
              React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
              React.createElement(
                "button",
                { type: "submit", className: "btn btn-success btn-sm btn-block" },
                "Purchase"
              )
            )
          )
        )
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "div",
        { className: "row justify-content-center border border-info" },
        React.createElement(
          "div",
          { className: "col-sm-8 text-center" },
          React.createElement(
            "p",
            { className: "lead" },
            "Upgrade by 250 mining power"
          ),
          React.createElement(
            "p",
            null,
            React.createElement("img", { width: "25", height: "25", src: ironIcon.src, alt: "" }),
            ": ",
            48000,
            React.createElement("img", { width: "25", height: "25", src: copperIcon.src, alt: "" }),
            ": ",
            5120,
            React.createElement("img", { width: "25", height: "25", src: sapphireIcon.src, alt: "" }),
            ": ",
            384,
            React.createElement("img", { width: "25", height: "25", src: emeraldIcon.src, alt: "" }),
            ": ",
            64,
            React.createElement("img", { width: "25", height: "25", src: rubyIcon.src, alt: "" }),
            ": ",
            16,
            React.createElement("img", { width: "25", height: "25", src: diamondIcon.src, alt: "" }),
            ": ",
            2
          )
        ),
        React.createElement(
          "div",
          { className: "col-sm-4 text-center upgrade-button" },
          React.createElement(
            "form",
            { id: "upgradeForm250", onSubmit: function onSubmit(e) {
                e.preventDefault();handlePurchase(250);
              }, name: "handlePurchaseForm", action: "/purchaseUpgrade", method: "POST" },
            React.createElement(
              "fieldset",
              null,
              React.createElement("input", { type: "hidden", name: "power", value: "250" }),
              React.createElement("input", { type: "hidden", name: "iron", value: "48000" }),
              React.createElement("input", { type: "hidden", name: "copper", value: "5120" }),
              React.createElement("input", { type: "hidden", name: "sapphire", value: "384" }),
              React.createElement("input", { type: "hidden", name: "emerald", value: "64" }),
              React.createElement("input", { type: "hidden", name: "ruby", value: "16" }),
              React.createElement("input", { type: "hidden", name: "diamond", value: "2" }),
              React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
              React.createElement(
                "button",
                { type: "submit", className: "btn btn-success btn-sm btn-block" },
                "Purchase"
              )
            )
          )
        )
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "div",
        { className: "row justify-content-center border border-info" },
        React.createElement(
          "div",
          { className: "col-sm-8 text-center" },
          React.createElement(
            "p",
            { className: "lead" },
            "Upgrade by 500 mining power"
          ),
          React.createElement(
            "p",
            null,
            React.createElement("img", { width: "25", height: "25", src: ironIcon.src, alt: "" }),
            ": ",
            174000,
            React.createElement("img", { width: "25", height: "25", src: copperIcon.src, alt: "" }),
            ": ",
            20480,
            React.createElement("img", { width: "25", height: "25", src: sapphireIcon.src, alt: "" }),
            ": ",
            1536,
            React.createElement("img", { width: "25", height: "25", src: emeraldIcon.src, alt: "" }),
            ": ",
            256,
            React.createElement("img", { width: "25", height: "25", src: rubyIcon.src, alt: "" }),
            ": ",
            96,
            React.createElement("img", { width: "25", height: "25", src: diamondIcon.src, alt: "" }),
            ": ",
            8
          )
        ),
        React.createElement(
          "div",
          { className: "col-sm-4 text-center upgrade-button" },
          React.createElement(
            "form",
            { id: "upgradeForm500", onSubmit: function onSubmit(e) {
                e.preventDefault();handlePurchase(500);
              }, name: "handlePurchaseForm", action: "/purchaseUpgrade", method: "POST" },
            React.createElement(
              "fieldset",
              null,
              React.createElement("input", { type: "hidden", name: "power", value: "500" }),
              React.createElement("input", { type: "hidden", name: "iron", value: "174000" }),
              React.createElement("input", { type: "hidden", name: "copper", value: "20480" }),
              React.createElement("input", { type: "hidden", name: "sapphire", value: "1536" }),
              React.createElement("input", { type: "hidden", name: "emerald", value: "256" }),
              React.createElement("input", { type: "hidden", name: "ruby", value: "96" }),
              React.createElement("input", { type: "hidden", name: "diamond", value: "8" }),
              React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
              React.createElement(
                "button",
                { type: "submit", className: "btn btn-success btn-sm btn-block" },
                "Purchase"
              )
            )
          )
        )
      )
    )
  );
};

//Construct a window to allow the player to view the game's highscores
var HighscoreWindow = function HighscoreWindow(props) {

  var scores = props.scores.map(function (score, index) {

    //Change the color if the listed user is this user
    var color = "primary";
    if (score.username === username) {
      color = "info";
    }

    //Build a list item for each individual score
    return React.createElement(
      "li",
      { className: "list-group-item d-flex border border-" + color },
      React.createElement(
        "div",
        { className: "container" },
        React.createElement(
          "div",
          { className: "row justify-content-center" },
          React.createElement(
            "div",
            { className: "col-lg-3 flex-center" },
            React.createElement(
              "span",
              { className: "badge badge-" + color + " badge-pill" },
              "#",
              index + 1
            ),
            React.createElement(
              "span",
              { className: "lead space-left" },
              " User: ",
              score.username
            )
          ),
          React.createElement(
            "div",
            { className: "col-lg-6" },
            React.createElement(
              "p",
              { className: "lead text-center" },
              "Resources"
            ),
            React.createElement(
              "div",
              { className: "flex-center" },
              React.createElement(
                "ul",
                null,
                React.createElement(
                  "li",
                  { className: "flex-center" },
                  React.createElement("img", { width: "25", height: "25", src: gbIcon.src, alt: "" }),
                  " GB: ",
                  score.bank.gb
                ),
                React.createElement(
                  "li",
                  { className: "flex-center" },
                  React.createElement("img", { width: "25", height: "25", src: ironIcon.src, alt: "" }),
                  " Iron: ",
                  score.bank.iron
                ),
                React.createElement(
                  "li",
                  { className: "flex-center" },
                  React.createElement("img", { width: "25", height: "25", src: copperIcon.src, alt: "" }),
                  " Copper: ",
                  score.bank.copper
                ),
                React.createElement(
                  "li",
                  { className: "flex-center" },
                  React.createElement("img", { width: "25", height: "25", src: sapphireIcon.src, alt: "" }),
                  " Sapphires: ",
                  score.bank.sapphire
                )
              ),
              React.createElement(
                "ul",
                null,
                React.createElement(
                  "li",
                  { className: "flex-center" },
                  React.createElement("img", { width: "25", height: "25", src: emeraldIcon.src, alt: "" }),
                  " Emeralds: ",
                  score.bank.emerald
                ),
                React.createElement(
                  "li",
                  { className: "flex-center" },
                  React.createElement("img", { width: "25", height: "25", src: rubyIcon.src, alt: "" }),
                  " Rubies: ",
                  score.bank.ruby
                ),
                React.createElement(
                  "li",
                  { className: "flex-center" },
                  React.createElement("img", { width: "25", height: "25", src: diamondIcon.src, alt: "" }),
                  " Diamonds: ",
                  score.bank.diamond
                )
              )
            )
          ),
          React.createElement(
            "div",
            { className: "col-lg-3 flex-center" },
            React.createElement(
              "p",
              { className: "lead" },
              "Score: ",
              score.score
            )
          )
        )
      )
    );
  });

  var scoreLists = [];
  var paginationTabs = [];

  //Break up the number of returned scores into chunks of 10
  for (var i = 0; i < scores.length; i += 10) {

    var numScoresLeft = scores.length - i;
    var scoreSet = void 0;

    if (numScoresLeft <= 10) {
      scoreSet = scores.slice(i);
    } else {
      scoreSet = scores.slice(i, i + 10);
    }

    //If it's the first set, make it visible. Otherwise, hide the set
    if (i == 0) {
      scoreLists.push(React.createElement(
        "ul",
        { id: "scoreSet" + scoreLists.length, className: "list-group" },
        scoreSet
      ));
      paginationTabs.push(React.createElement(
        "li",
        { id: "scoreLink" + paginationTabs.length, className: "page-item active" },
        React.createElement(
          "button",
          { className: "page-link", "data-set": paginationTabs.length, onClick: changeScoreSet },
          paginationTabs.length + 1
        )
      ));
    } else {
      scoreLists.push(React.createElement(
        "ul",
        { id: "scoreSet" + scoreLists.length, className: "list-group hidden" },
        scoreSet
      ));
      paginationTabs.push(React.createElement(
        "li",
        { id: "scoreLink" + paginationTabs.length, className: "page-item" },
        React.createElement(
          "button",
          { className: "page-link", "data-set": paginationTabs.length, onClick: changeScoreSet },
          paginationTabs.length + 1
        )
      ));
    }
  }

  //Bundle all of the lists together and display them
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
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "div",
        { id: "highscoreList" },
        scoreLists
      ),
      React.createElement(
        "div",
        { className: "flex-center" },
        React.createElement(
          "ul",
          { id: "scorePagination", className: "pagination pagination-lg moveDown" },
          React.createElement(
            "li",
            { className: "page-item" },
            React.createElement(
              "button",
              { className: "page-link", "data-set": "0", onClick: changeScoreSet },
              "\xAB"
            )
          ),
          paginationTabs,
          React.createElement(
            "li",
            { className: "page-item" },
            React.createElement(
              "button",
              { className: "page-link", "data-set": paginationTabs.length - 1, onClick: changeScoreSet },
              "\xBB"
            )
          )
        )
      )
    )
  );
};

//Helper function to change the set of actively visible highscores
var changeScoreSet = function changeScoreSet(e) {
  //Turn off active link / hide the active score set
  var scorePagination = document.querySelector("#scorePagination");
  var activeLink = scorePagination.querySelector(".active");
  var activeLinkId = activeLink.getAttribute("id");
  var activeScoreSet = document.querySelector("#scoreSet" + activeLinkId.charAt(activeLinkId.length - 1));
  activeLink.classList.remove("active");
  activeScoreSet.classList.add("hidden");

  //Active the necessary tab
  var dataSet = e.target.getAttribute("data-set");
  document.querySelector("#scoreLink" + dataSet).classList.add("active");
  document.querySelector("#scoreSet" + dataSet).classList.remove("hidden");
};

//Handle a request to change a password
var handlePasswordChange = function handlePasswordChange(e) {
  e.preventDefault();

  //Password fields cannot be empty
  if ($("#newPassword").val() == '' || $("#newPassword2").val() == '' || $("#password").val() == '') {
    handleError("All fields are required to change password.");
    return false;
  }

  //New password and password confirmation should match
  if ($("#newPassword").val() !== $("#newPassword2").val()) {
    handleError("New password and password confirmation must match");
    return false;
  }

  //Send the data to the server via Ajax
  sendAjax('POST', $("#passwordChangeForm").attr("action"), $("#passwordChangeForm").serialize(), function () {
    handleSuccess("Password successfully changed!");
    $("#newPassword").val("");
    $("#newPassword2").val("");
    $("#password").val("");
  });

  return false;
};

//Construct a window to allow the player to view their profile
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
        "Miner ID: ",
        username
      ),
      React.createElement("hr", { className: "my-4" }),
      React.createElement(
        "h2",
        null,
        "Bank Details"
      ),
      React.createElement(
        "ul",
        null,
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: gbIcon.src, alt: "" }),
          " GB: ",
          account.bank.gb
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: ironIcon.src, alt: "" }),
          " Iron: ",
          account.bank.iron
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: copperIcon.src, alt: "" }),
          " Copper: ",
          account.bank.copper
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: sapphireIcon.src, alt: "" }),
          " Sapphires: ",
          account.bank.sapphire
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: emeraldIcon.src, alt: "" }),
          " Emeralds: ",
          account.bank.emerald
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: rubyIcon.src, alt: "" }),
          " Rubies: ",
          account.bank.ruby
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: diamondIcon.src, alt: "" }),
          " Diamonds: ",
          account.bank.diamond
        )
      ),
      React.createElement("hr", null),
      React.createElement(
        "form",
        {
          id: "passwordChangeForm", name: "passwordChangeForm",
          action: "/updatePassword",
          onSubmit: handlePasswordChange,
          method: "POST"
        },
        React.createElement(
          "fieldset",
          null,
          React.createElement(
            "div",
            { className: "form-group text-centered row" },
            React.createElement(
              "label",
              { htmlFor: "newPassword", className: "col-sm-3 col-form-label" },
              "New Password:"
            ),
            React.createElement(
              "div",
              { className: "col-sm-3" },
              React.createElement("input", { id: "newPassword", name: "newPassword", type: "password", className: "form-control", placeholder: "New Password" })
            ),
            React.createElement("div", { className: "col-sm-6" })
          ),
          React.createElement(
            "div",
            { className: "form-group text-centered row" },
            React.createElement(
              "label",
              { htmlFor: "newPassword2", className: "col-sm-3 col-form-label" },
              "Confirm New Password:"
            ),
            React.createElement(
              "div",
              { className: "col-sm-3" },
              React.createElement("input", { id: "newPassword2", name: "newPassword2", type: "password", className: "form-control", placeholder: "Confirm" })
            ),
            React.createElement("div", { className: "col-sm-6" })
          ),
          React.createElement(
            "div",
            { className: "form-group text-centered row" },
            React.createElement(
              "label",
              { htmlFor: "password", className: "col-sm-3 col-form-label" },
              "Current Password:"
            ),
            React.createElement(
              "div",
              { className: "col-sm-3" },
              React.createElement("input", { id: "password", name: "password", type: "password", className: "form-control", placeholder: "Current Password" })
            ),
            React.createElement("div", { className: "col-sm-6" })
          ),
          React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
          React.createElement(
            "div",
            { className: "form-group text-centered row" },
            React.createElement(
              "div",
              { className: "col-sm-5" },
              React.createElement("input", { type: "submit", id: "passwordChangeSubmit", value: "Change Password", className: "btn btn-lg btn-warning formSubmit" })
            ),
            React.createElement("div", { className: "col-sm-3" }),
            React.createElement("div", { className: "col-sm-4" })
          )
        )
      )
    )
  );
};

//Helper method to request that the user's account be credited with Galaxy Bucks
var getGalaxyBucks = function getGalaxyBucks(e) {
  var amount = e.target.getAttribute('data-gb');

  if (!amount) {
    return;
  }

  getTokenWithCallback(function (csrfToken) {
    var data = "gb=" + amount + "&_csrf=" + csrfToken;
    sendAjax('POST', '/getGalaxyBucks', data, function (data) {
      socket.emit('getMyBankData');
      handleSuccess(data.message);
    });
  });
};

//Construct a window for buying galaxy bucks (the best currency in the universe!
var PayToWinWindow = function PayToWinWindow(props) {
  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "row justify-content-center" },
      React.createElement(
        "h1",
        null,
        "Galaxy Bucks"
      )
    ),
    React.createElement(
      "div",
      { className: "row justify-content-center" },
      React.createElement(
        "p",
        { className: "lead" },
        "Only the Best Currency in the Universe!"
      )
    ),
    React.createElement(
      "div",
      { className: "row justify-content-center" },
      React.createElement(
        "div",
        { className: "col-lg-12" },
        React.createElement(
          "div",
          { className: "jumbotron justify-content-center" },
          React.createElement(
            "h2",
            { className: "text-success" },
            "Free"
          ),
          React.createElement("hr", null),
          React.createElement(
            "p",
            { className: "lead" },
            "Watch an advertisement from our sponsor Robo Corp\xAE, to earn some Galaxy Bucks for free! (Note* Payment of 30 seconds of your time is required by law in order to qualify for this Galaxy Bucks offer)"
          ),
          React.createElement("hr", null),
          React.createElement(
            "div",
            { className: "text-center" },
            React.createElement(
              "button",
              { className: "btn btn-lg btn-primary", onClick: loadAd },
              "Watch Ad"
            )
          )
        )
      )
    ),
    React.createElement(
      "div",
      { className: "row justify-content-center" },
      React.createElement(
        "div",
        { className: "col-lg-4" },
        React.createElement(
          "div",
          { className: "jumbotron justify-content-center" },
          React.createElement(
            "h2",
            { className: "text-success" },
            "Tier 1"
          ),
          React.createElement("hr", null),
          React.createElement(
            "ul",
            { className: "lead" },
            React.createElement(
              "li",
              null,
              "Cost: $1"
            ),
            React.createElement(
              "li",
              null,
              "GBs: 1000"
            ),
            React.createElement(
              "li",
              null,
              "Value: Good"
            )
          ),
          React.createElement("hr", null),
          React.createElement(
            "div",
            { className: "text-center" },
            React.createElement(
              "button",
              { onClick: getGalaxyBucks, "data-gb": "1000", className: "btn btn-lg btn-primary" },
              "Purchase"
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "col-lg-4" },
        React.createElement(
          "div",
          { className: "jumbotron justify-content-center" },
          React.createElement(
            "h2",
            { className: "text-success" },
            "Tier 2"
          ),
          React.createElement("hr", null),
          React.createElement(
            "ul",
            { className: "lead" },
            React.createElement(
              "li",
              null,
              "Cost: $5"
            ),
            React.createElement(
              "li",
              null,
              "GBs: 6000"
            ),
            React.createElement(
              "li",
              null,
              "Value: Great"
            )
          ),
          React.createElement("hr", null),
          React.createElement(
            "div",
            { className: "text-center" },
            React.createElement(
              "button",
              { onClick: getGalaxyBucks, "data-gb": "6000", className: "btn btn-lg btn-primary" },
              "Purchase"
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "col-lg-4" },
        React.createElement(
          "div",
          { className: "jumbotron justify-content-center" },
          React.createElement(
            "h2",
            { className: "text-success" },
            "Tier 3"
          ),
          React.createElement("hr", null),
          React.createElement(
            "ul",
            { className: "lead" },
            React.createElement(
              "li",
              null,
              "Cost: $20"
            ),
            React.createElement(
              "li",
              null,
              "GBs: 25000"
            ),
            React.createElement(
              "li",
              null,
              "Value: Best"
            )
          ),
          React.createElement("hr", null),
          React.createElement(
            "div",
            { className: "text-center" },
            React.createElement(
              "button",
              { onClick: getGalaxyBucks, "data-gb": "25000", className: "btn btn-lg btn-primary" },
              "Purchase"
            )
          )
        )
      )
    )
  );
};

//Construct an ad modal to let the user watch an ad to earn Galaxy Bucks
var AdModal = function AdModal(props) {

  var modalBody = void 0;

  //Render the ad if requested
  if (props.render) {
    var dimensions = calcDisplayDimensions();
    var ratio = Math.min(window.innerHeight * 0.5 / dimensions.height, 1);
    dimensions.width *= ratio;
    dimensions.height *= ratio;
    modalBody = React.createElement(
      "div",
      { className: "justify-content-center text-center" },
      React.createElement("canvas", { id: "adViewport", className: "animateExpand", width: dimensions.width, height: dimensions.height })
    );
  } else {
    modalBody = React.createElement(
      "p",
      null,
      "Loading Robo Corp\xAE Ad... ",
      React.createElement("span", { className: "fas fa-sync fa-spin" })
    );
  }

  //When the add completes
  var completeAd = function completeAd(e) {
    hideModal(e);
    getGalaxyBucks(e);
  };

  return React.createElement(
    "div",
    { id: "adModal", className: "modal show", tabindex: "-1", role: "dialog" },
    React.createElement("div", { id: "pageMask" }),
    React.createElement(
      "div",
      { className: "modal-dialog", role: "document" },
      React.createElement(
        "div",
        { className: "modal-content" },
        React.createElement(
          "div",
          { className: "modal-header" },
          React.createElement(
            "h1",
            { className: "modal-title" },
            "Ad from Robo Corp\xAE"
          ),
          React.createElement(
            "button",
            { className: "close", "data-dismiss": "modal", "aria-label": "Close", onClick: hideModal },
            React.createElement(
              "span",
              { "aria-hidden": "true" },
              "\xD7"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "modal-body" },
          modalBody
        ),
        React.createElement(
          "div",
          { className: "modal-footer" },
          React.createElement(
            "button",
            { id: "payoutButton", "data-gb": "50", className: "btn btn-lg btn-primary",
              "data-dismiss": "modal", onClick: completeAd },
            "Collect 50 GBs"
          )
        )
      )
    )
  );
};

//Contruct a modal to handle drafting a sub contract
var SubContractModal = function SubContractModal(props) {

  var contractOptions = props.contracts.map(function (contract) {
    return React.createElement(
      "option",
      { value: contract.contractId },
      "Class ",
      contract.asteroid.classname.toUpperCase(),
      " asteroid -> Progress: ",
      contract.asteroid.progress,
      " / ",
      contract.asteroid.toughness
    );
  });

  return React.createElement(
    "div",
    { id: "subContractModal", className: "modal show", tabindex: "-1", role: "dialog" },
    React.createElement("div", { id: "pageMask" }),
    React.createElement(
      "div",
      { className: "modal-dialog", role: "document" },
      React.createElement(
        "div",
        { className: "modal-content" },
        React.createElement(
          "div",
          { className: "modal-header" },
          React.createElement(
            "h1",
            { className: "modal-title" },
            "Sub Contract Draft ",
            React.createElement("span", { className: "fas fa-edit" })
          ),
          React.createElement(
            "button",
            { className: "close", "data-dismiss": "modal", "aria-label": "Close", onClick: hideModal },
            React.createElement(
              "span",
              { "aria-hidden": "true" },
              "\xD7"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "modal-body" },
          React.createElement(
            "div",
            { className: "container" },
            React.createElement(
              "div",
              { className: "row" },
              React.createElement("div", { className: "col-xl-3" }),
              React.createElement(
                "div",
                { className: "col-xl-6" },
                React.createElement(
                  "form",
                  { id: "subContractForm", className: "form", onSubmit: handleSubContractSubmit,
                    action: "/createSubContract"
                  },
                  React.createElement(
                    "label",
                    { htmlFor: "contract", className: "form-input-label" },
                    "Contract"
                  ),
                  React.createElement(
                    "select",
                    { name: "contract", className: "custom-select" },
                    contractOptions
                  ),
                  React.createElement(
                    "label",
                    { htmlFor: "clicks", className: "form-input-label" },
                    "Clicks Requested"
                  ),
                  React.createElement("input", { id: "clickNum", name: "clicks", className: "form-control", type: "number", min: "1", max: "1000000" }),
                  React.createElement(
                    "label",
                    { className: "form-input-label" },
                    "Resources Given"
                  ),
                  React.createElement(
                    "div",
                    { className: "row justify-content-center" },
                    React.createElement(
                      "div",
                      { className: "col-sm-4 text-center" },
                      React.createElement(
                        "label",
                        { className: "form-input-label" },
                        React.createElement("img", { src: gbIcon.src, width: "25", height: "25", alt: "" }),
                        " Galaxy Bucks: "
                      )
                    ),
                    React.createElement(
                      "div",
                      { className: "col-sm-8" },
                      React.createElement("input", { name: "gb", className: "form-control", type: "number", min: "0", max: "1000000" })
                    )
                  ),
                  React.createElement("hr", null),
                  React.createElement(
                    "div",
                    { className: "row justify-content-center" },
                    React.createElement(
                      "div",
                      { className: "col-sm-4 text-center" },
                      React.createElement(
                        "label",
                        { className: "form-input-label" },
                        React.createElement("img", { src: ironIcon.src, width: "25", height: "25", alt: "" }),
                        " Iron: "
                      )
                    ),
                    React.createElement(
                      "div",
                      { className: "col-sm-8" },
                      React.createElement("input", { name: "iron", className: "form-control", type: "number", min: "0", max: "1000000" })
                    )
                  ),
                  React.createElement("hr", null),
                  React.createElement(
                    "div",
                    { className: "row justify-content-center" },
                    React.createElement(
                      "div",
                      { className: "col-sm-4 text-center" },
                      React.createElement(
                        "label",
                        { className: "form-input-label" },
                        React.createElement("img", { src: copperIcon.src, width: "25", height: "25", alt: "" }),
                        " Copper: "
                      )
                    ),
                    React.createElement(
                      "div",
                      { className: "col-sm-8" },
                      React.createElement("input", { name: "copper", className: "form-control", type: "number", min: "0", max: "1000000" })
                    )
                  ),
                  React.createElement("hr", null),
                  React.createElement(
                    "div",
                    { className: "row justify-content-center" },
                    React.createElement(
                      "div",
                      { className: "col-sm-4 text-center" },
                      React.createElement(
                        "label",
                        { className: "form-input-label" },
                        React.createElement("img", { src: sapphireIcon.src, width: "25", height: "25", alt: "" }),
                        " Sapphires: "
                      )
                    ),
                    React.createElement(
                      "div",
                      { className: "col-sm-8" },
                      React.createElement("input", { name: "sapphire", className: "form-control", type: "number", min: "0", max: "1000000" })
                    )
                  ),
                  React.createElement("hr", null),
                  React.createElement(
                    "div",
                    { className: "row justify-content-center" },
                    React.createElement(
                      "div",
                      { className: "col-sm-4 text-center" },
                      React.createElement(
                        "label",
                        { className: "form-input-label" },
                        React.createElement("img", { src: emeraldIcon.src, width: "25", height: "25", alt: "" }),
                        " Emeralds: "
                      )
                    ),
                    React.createElement(
                      "div",
                      { className: "col-sm-8" },
                      React.createElement("input", { name: "emerald", className: "form-control", type: "number", min: "0", max: "1000000" })
                    )
                  ),
                  React.createElement("hr", null),
                  React.createElement(
                    "div",
                    { className: "row justify-content-center" },
                    React.createElement(
                      "div",
                      { className: "col-sm-4 text-center" },
                      React.createElement(
                        "label",
                        { className: "form-input-label" },
                        React.createElement("img", { src: rubyIcon.src, width: "25", height: "25", alt: "" }),
                        " Rubies: "
                      )
                    ),
                    React.createElement(
                      "div",
                      { className: "col-sm-8" },
                      React.createElement("input", { name: "ruby", className: "form-control", type: "number", min: "0", max: "1000000" })
                    )
                  ),
                  React.createElement("hr", null),
                  React.createElement(
                    "div",
                    { className: "row justify-content-center" },
                    React.createElement(
                      "div",
                      { className: "col-sm-4 text-center" },
                      React.createElement(
                        "label",
                        { className: "form-input-label" },
                        React.createElement("img", { src: diamondIcon.src, width: "25", height: "25", alt: "" }),
                        " Diamonds: "
                      )
                    ),
                    React.createElement(
                      "div",
                      { className: "col-sm-8" },
                      React.createElement("input", { name: "diamond", className: "form-control", type: "number", min: "0", max: "1000000" })
                    )
                  ),
                  React.createElement("input", { className: "hidden", name: "_csrf", value: props.csrf })
                )
              ),
              React.createElement("div", { className: "col-xl-3" })
            )
          )
        ),
        React.createElement(
          "div",
          { className: "modal-footer" },
          React.createElement(
            "button",
            { id: "cancelButton", className: "btn btn-lg btn-danger",
              "data-dismiss": "modal", onClick: hideModal },
            "Cancel"
          ),
          React.createElement(
            "button",
            { id: "subContractSubmit", className: "btn btn-lg btn-primary",
              "data-dismiss": "modal", onClick: handleSubContractSubmit },
            "Create Sub Contract"
          )
        )
      )
    )
  );
};

//Construct a panel that shows a user's mining progress
var ProgressPanel = function ProgressPanel(props) {

  //Render user's bank details if available
  var userDetails = void 0;
  if (account.bank) {
    userDetails = React.createElement(
      "div",
      null,
      React.createElement(
        "h1",
        null,
        "Account Info"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Miner ID: ",
        username
      ),
      React.createElement(
        "p",
        { classname: "lead" },
        "Bank Details"
      ),
      React.createElement(
        "ul",
        null,
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: gbIcon.src, alt: "" }),
          " GB: ",
          account.bank.gb
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: ironIcon.src, alt: "" }),
          " Iron: ",
          account.bank.iron
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: copperIcon.src, alt: "" }),
          " Copper: ",
          account.bank.copper
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: sapphireIcon.src, alt: "" }),
          " Sapphires: ",
          account.bank.sapphire
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: emeraldIcon.src, alt: "" }),
          " Emeralds: ",
          account.bank.emerald
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: rubyIcon.src, alt: "" }),
          " Rubies: ",
          account.bank.ruby
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: diamondIcon.src, alt: "" }),
          " Diamonds: ",
          account.bank.diamond
        )
      ),
      React.createElement("hr", null)
    );
  }

  //Show recently attained resources if applicable
  var asteroidRewards = void 0;
  if (account.rewards) {
    asteroidRewards = React.createElement(
      "div",
      null,
      React.createElement(
        "h1",
        null,
        "Recent Rewards"
      ),
      React.createElement(
        "ul",
        { className: "text-success" },
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: gbIcon.src, alt: "" }),
          " GB: +",
          compressNumber(account.rewards.gb)
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: ironIcon.src, alt: "" }),
          " Iron: +",
          compressNumber(account.rewards.iron)
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: copperIcon.src, alt: "" }),
          " Copper: +",
          compressNumber(account.rewards.copper)
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: sapphireIcon.src, alt: "" }),
          " Sapphires: +",
          compressNumber(account.rewards.sapphire)
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: emeraldIcon.src, alt: "" }),
          " Emeralds: +",
          compressNumber(account.rewards.emerald)
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: rubyIcon.src, alt: "" }),
          " Rubies: +",
          compressNumber(account.rewards.ruby)
        ),
        React.createElement(
          "li",
          null,
          React.createElement("img", { width: "25", height: "25", src: diamondIcon.src, alt: "" }),
          " Diamonds: +",
          compressNumber(account.rewards.diamond)
        )
      ),
      React.createElement("hr", null)
    );
  }

  //Render asteroid progress if applicable
  var asteroidProgress = void 0;
  var asteroidProgressWidth = void 0;
  if (props.current > -1 && props.total > -1) {
    asteroidProgressWidth = { width: props.current / props.total * 100 + "%" };
    asteroidProgress = React.createElement(
      "div",
      null,
      React.createElement(
        "h1",
        null,
        "Asteroid Progress"
      ),
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
        { className: "progress bg-light" },
        React.createElement("div", { className: "progress-bar progress-bar-striped progress-bar-animated bg-success",
          role: "progressbar",
          "aria-value": props.current,
          "aria-valuemin": "0",
          "aria-valuemax": props.total,
          style: asteroidProgressWidth
        })
      ),
      React.createElement("hr", null)
    );
  }

  //Render sub contract progress if applicable
  var subContractProgress = void 0;
  var subContractProgressWidth = void 0;
  if (props.sub) {
    subContractProgressWidth = { width: props.sub.progress / props.sub.clicks * 100 + "%" };
    subContractProgress = React.createElement(
      "div",
      null,
      React.createElement(
        "h1",
        null,
        "Sub Contract"
      ),
      React.createElement(
        "p",
        { className: "lead" },
        "Clicks: ",
        props.sub.progress,
        "/",
        props.sub.clicks
      ),
      React.createElement(
        "div",
        { className: "progress bg-light" },
        React.createElement("div", { className: "progress-bar progress-bar-striped progress-bar-animated bg-info",
          role: "progressbar",
          "aria-value": props.sub.progress,
          "aria-valuemin": "0",
          "aria-valuemax": props.sub.clicks,
          style: subContractProgressWidth
        })
      ),
      React.createElement("hr", null)
    );
  }

  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "jumbotron" },
      userDetails,
      asteroidRewards,
      asteroidProgress,
      subContractProgress
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
  canvas.addEventListener('mousemove', processMouseMove);
};

//Load an ad to display to the user
var loadAd = function loadAd() {
  renderAd(false);
  var payoutButton = document.querySelector("#payoutButton");
  payoutButton.disabled = true;

  sendAjax('GET', '/getAd', null, function (result) {
    processAd(result.ad);
  });
};

//Render the ad modal (and show an ad to the user)
var renderAd = function renderAd(render) {
  ReactDOM.render(React.createElement(AdModal, { render: render }), document.querySelector("#adContainer"));

  if (render) {
    adCanvas = document.querySelector("#adViewport");
    adCtx = adCanvas.getContext('2d');
  }

  var modal = document.querySelector("#adContainer div");

  if (!modal) {
    return;
  }

  modal.classList.remove("hide-anim");
  modal.classList.add("show");
};

//Hide the ad modal
var hideModal = function hideModal(e) {
  var adModal = document.querySelector("#adContainer");
  var subContractModal = document.querySelector("#subContractModalContainer");

  if (!adModal && !subContractModal) {
    return;
  }

  if (e) {
    if (adModal.contains(e.target)) {

      if (adAudio) {
        adAudio.pause();
        adAudio.currenTime = 0;
      }

      showingAd = false;
      document.querySelector("#adContainer div").classList.add("hide-anim");
    } else if (subContractModal.contains(e.target)) {
      document.querySelector("#subContractModalContainer div").classList.add("hide-anim");
    }
  } else {
    if (adModal.querySelector('div')) {
      document.querySelector("#adContainer div").classList.add("hide-anim");
    }

    if (subContractModal.querySelector('div')) {
      document.querySelector("#subContractModalContainer div").classList.add("hide-anim");
    }
  }
};

//Render the sub contract modal
var renderSubContractModal = function renderSubContractModal() {
  getTokenWithCallback(function (csrfToken) {
    ReactDOM.render(React.createElement(SubContractModal, { contracts: availableContracts, csrf: csrfToken }), document.querySelector("#subContractModalContainer"));

    var modal = document.querySelector("#subContractModalContainer div");

    if (!modal) {
      return;
    }

    modal.classList.remove("hide-anim");
    modal.classList.add("show");
  });
};

//Render the galaxy bucks purchase window
var renderPayToWin = function renderPayToWin() {
  ReactDOM.render(React.createElement(PayToWinWindow, null), document.querySelector("#main"));
};

//Render the asteroid's progress panel
var renderProgressPanel = function renderProgressPanel(current, total) {
  ReactDOM.render(React.createElement(ProgressPanel, { sub: subContract, current: current, total: total }), document.querySelector("#rightPanel"));
};

//Populate contract window with returned contracts
var populateContractsWindow = function populateContractsWindow(data) {
  ReactDOM.render(React.createElement(BasicContracts, { contracts: data.basicContracts }), document.querySelector("#basicContracts"));
};

//Populate contract window with returned sub contracts
var populateSubContractsWindow = function populateSubContractsWindow(data) {
  ReactDOM.render(React.createElement(SubContracts, { contracts: data.subContracts }), document.querySelector("#subContracts"));
};

// To Do: Make PartnerContracts react object
var populatePartnerContractsWindow = function populatePartnerContractsWindow(data) {
  ReactDOM.render(React.createElement(PartnerContracts, { contracts: data.openContracts }), document.querySelector("#partnerContracts"));
};

//Populate already owned contracts with data sent from server
var populateMyContractsWindow = function populateMyContractsWindow(data) {
  ReactDOM.render(React.createElement(MyContracts, { data: data }), document.querySelector("#myContracts"));
};

//Populate owned sub contracts for owner to view progress
var populateMySubContractsWindow = function populateMySubContractsWindow(data) {
  ReactDOM.render(React.createElement(MySubContracts, { data: data }), document.querySelector("#mySubContracts"));
};

//Render the 'MyContracts' side panel
var availableContracts = [];
var renderMyContractsPanel = function renderMyContractsPanel() {
  ReactDOM.render(React.createElement(MyContractsWindow, null), document.querySelector("#leftPanel"));

  sendAjax('GET', '/getMyContracts', null, function (result) {
    availableContracts = result.contracts;
    populateMyContractsWindow(result);
    populateMySubContractsWindow(result.ownedSubs);
  });
};

//Add more handlers and components if necessary
var renderContracts = function renderContracts() {
  ReactDOM.render(React.createElement(ContractWindow, null), document.querySelector("#main"));

  renderMyContractsPanel();

  sendAjax('GET', '/getContracts', null, function (result) {
    populateContractsWindow(result);
  });
  sendAjax('GET', '/getPartnerContracts', null, function (result) {
    populatePartnerContractsWindow(result);
  });
  sendAjax('GET', '/getSubContracts', null, function (result) {
    populateSubContractsWindow(result);
  });
};

//Render the market view (players sell resources)
var renderMarket = function renderMarket() {
  getTokenWithCallback(function (csrfToken) {
    sendAjax('GET', '/getRCCTR', null, function (result) {
      ReactDOM.render(React.createElement(MarketWindow, { csrf: csrfToken, rates: result.rates }), document.querySelector("#main"));

      var marketFormInputs = document.querySelectorAll("#marketForm input[type=number]");
      for (var i = 0; i < marketFormInputs.length; i++) {
        var input = marketFormInputs[i];
        input.oninput = renderMarket;
      }
    });
  });
};

//Render the upgrade view (players purchase mining upgrades
var renderUpgrades = function renderUpgrades() {
  getTokenWithCallback(function (csrfToken) {
    ReactDOM.render(React.createElement(UpgradesWindow, { csrf: csrfToken }), document.querySelector("#main"));
  });
};

//Render the highscores view (players compare scores)
var renderHighscores = function renderHighscores() {
  //Initially create a blank panel
  ReactDOM.render(React.createElement(HighscoreWindow, { scores: [] }), document.querySelector("#main"));

  //Request highscore data and then display the scores
  sendAjax('GET', '/getHighscores', null, function (result) {
    ReactDOM.render(React.createElement(HighscoreWindow, { scores: result.scores }), document.querySelector("#main"));
  });
};

//Render the player's profile
var renderProfile = function renderProfile() {
  getTokenWithCallback(function (csrfToken) {
    ReactDOM.render(React.createElement(ProfileWindow, { csrf: csrfToken }), document.querySelector("#main"));
  });
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

  //Update player position (skip lerping for player)
  player.x = player.destX;
  player.y = player.destY;

  //Update other players (lerp)
  var playerKeys = Object.keys(players);
  for (var i = 0; i < playerKeys.length; i++) {
    var ply = players[playerKeys[i]];

    ply.x = lerp(ply.prevX, ply.destX, ply.ratio);
    ply.y = lerp(ply.prevY, ply.destY, ply.ratio);

    //Update lerping ratio
    if (ply.ratio < 1) {
      ply.ratio += 0.05;
    }
  }

  //Send a player update
  socket.emit('playerUpdate', {
    prevX: player.prevX,
    prevY: player.prevY,
    destX: player.destX,
    destY: player.destY,
    ratio: player.ratio
  });

  //Draw to the canvas (prep first, then display)
  if (showingAd) {
    drawAd();
  } else {
    draw();
  }

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
  mousePos = getMouse(e);
  socket.emit('click', { mouse: mousePos });
};

//Process a mouse movement on the main display canvas
var processMouseMove = function processMouseMove(e) {
  mousePos = getMouse(e);
  player.prevX = player.x;
  player.prevY = player.y;
  player.destX = mousePos.x;
  player.destY = mousePos.y;
  player.ratio = 0.05;
};

//Process a mouse click confirmation from the server from a player
var processPlayerClick = function processPlayerClick(data) {
  //Determine if the player is this client or another
  var ply = void 0;
  if (data.hash === hash) {
    ply = player;
  } else {
    ply = players[data.hash];
  }

  //Return if the client has not been created yet
  if (!ply) {
    return;
  }

  //Create a new effect circle and add it to the array (to be drawn and updated)
  var newEffectCircle = {
    x: ply.x,
    y: ply.y,
    r: ply.color.r,
    g: ply.color.g,
    b: ply.color.b,
    speed: 2,
    radius: 0,
    lineWidth: 20
  };

  effectCircles.push(newEffectCircle);
};

//Recolor a player's pick
//Inspired by: https://stackoverflow.com/questions/24405245/html5-canvas-change-image-color
var recolor = function recolor(player, color) {
  var tempCanvas = document.createElement("canvas");
  tempCanvas.width = pickIcon.width;
  tempCanvas.height = pickIcon.height;

  var tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(pickIcon, 0, 0);

  //Convert the image to color data
  var imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  var data = imageData.data;

  //Iterate over pixels and recolor image
  for (var i = 0; i < data.length; i += 4) {
    data[i] = color.r;
    data[i + 1] = color.g;
    data[i + 2] = color.b;
  }

  //Put the image data back into the canvas and export the image for later use
  tempCtx.putImageData(imageData, 0, 0);

  //Create a new image
  var image = new Image();

  image.onload = function () {
    player.pick = image;
  };

  image.src = tempCanvas.toDataURL();
};

//Process player specific data sent from the server
var setupPlayer = function setupPlayer(data) {

  hash = data.hash;

  player = {
    prevX: -200,
    prevY: -200,
    destX: -200,
    destY: -200,
    ratio: 0.05,
    x: -200,
    y: -200,
    hash: data.hash,
    color: data.color
  };

  recolor(player, player.color);
};

//Process a player update
var updatePlayer = function updatePlayer(data) {
  var ply = void 0;

  //If the player is the current client, refer to the player object
  if (player.hash === data.hash) {
    ply = player;
  } else {
    //If the player is a different client, make sure they exist
    if (!players[data.hash]) {
      players[data.hash] = {
        color: data.color
      };
      recolor(players[data.hash], data.color);
    }

    ply = players[data.hash];
  }

  ply.prevX = data.prevX;
  ply.prevY = data.prevY;
  ply.destX = data.destX;
  ply.destY = data.destY;
  ply.ratio = data.ratio;
};

//Remove a player so that they aren't drawn and updated
var removePlayer = function removePlayer(data) {
  //Ensure the player exists in the client's data
  if (players[data.hash]) {
    players[data.hash] = null;
    delete players[data.hash];
  }
};

//Process a request from the server to spawn an asteroid
var spawnAsteroid = function spawnAsteroid(data) {
  var location = { x: prepCanvas.width / 2, y: prepCanvas.height / 2 };
  asteroid = new Asteroid(data.asteroid, location);

  //Reset gamespace
  effectCircles = [];
  players = [];
  gems = [];
  subContract = null;

  account.rewards = null;
  delete account.rewards;

  renderProgressPanel(asteroid.progress, asteroid.toughness);
};

//Process a request from the server to update the asteroid
var updateAsteroid = function updateAsteroid(data) {
  if (!asteroid) {
    return;
  }

  asteroid.updateVals(data.asteroid);
  renderProgressPanel(asteroid.progress, asteroid.toughness);
};

//Process a request from the server to update a sub contract
var updateSubContract = function updateSubContract(data) {
  if (!subContract) {
    subContract = {};
  }

  //Update the client's sub contract info
  var subKeys = Object.keys(data);
  for (var i = 0; i < subKeys.length; i++) {
    var key = subKeys[i];
    subContract[key] = data[key];
  }

  //Update the progress panel
  if (asteroid) {
    renderProgressPanel(asteroid.progress, asteroid.toughness);
  }
};

//Process a request from the server to finish an asteroid
var finishAsteroid = function finishAsteroid(data) {
  account.rewards = data.rewards;
  socket.emit('getMyBankData');

  data.rewards["rubble"] = 50;

  //Create a massive effect circle and add it to the array (to be drawn and updated)
  var newEffectCircle = {
    x: prepCanvas.width / 2,
    y: prepCanvas.height / 2,
    r: 244,
    g: 235,
    b: 66,
    speed: 20,
    radius: 0,
    lineWidth: 40
  };

  effectCircles.push(newEffectCircle);

  //Construct reward objects for entertainment purposes!
  var rewardKeys = Object.keys(data.rewards);
  for (var i = 0; i < rewardKeys.length; i++) {
    var key = rewardKeys[i];
    var numberRewards = Math.min(data.rewards[key], 500);
    var image = void 0;

    //Select the correct image
    switch (key) {
      case "iron":
        image = ironIcon;
        break;
      case "copper":
        image = copperIcon;
        break;
      case "sapphire":
        image = sapphireIcon;
        break;
      case "emerald":
        image = emeraldIcon;
        break;
      case "ruby":
        image = rubyIcon;
        break;
      case "diamond":
        image = diamondIcon;
        break;
      default:
        image = asteroid.image;
        break;
    }

    //Make the specified number of 'gems'
    for (var j = 0; j < numberRewards; j++) {

      //Give the gem a random velocity
      var randAngle = Math.random() * 360;
      var radian = randAngle * Math.PI / 180;
      var displayAngle = 0;
      var angleSpeed = Math.random() * 0.03;
      var speed = 20 * Math.random() + 2;
      var vector = {
        x: Math.sin(radian) * speed,
        y: Math.cos(radian) * speed
      };

      var gem = {
        image: image,
        x: prepCanvas.width / 2,
        y: prepCanvas.height / 2,
        radian: radian,
        speed: speed,
        vector: vector,
        displayAngle: displayAngle,
        angleSpeed: angleSpeed
      };

      gems.push(gem);
    }
  }

  asteroid = null;
};

//Process a request from the server to finish a sub contract
var finishSubContract = function finishSubContract(data) {
  subContract = null;
  account.rewards = data.rewards;
  socket.emit('getMyBankData');
};

//Process a request from the server to cancel a sub contract
var cancelSubContract = function cancelSubContract() {
  handleError('Your sub contract is now void because you did not complete the required number of clicks in time.');
};

//Process a request from the server to switch from a sub to a non sub contract
var stopSub = function stopSub() {
  subContract = null;
  account.rewards = null;
  delete account.rewards;
};

//Process a request from the server to update the player's account details
var updateAccount = function updateAccount(data) {
  //Iterate through the sent account keys and update the client's account object
  var updateKeys = Object.keys(data);
  for (var i = 0; i < updateKeys.length; i++) {
    var key = updateKeys[i];
    account[key] = data[key];
  }

  //Refresh the view in case relevant data has changed
  loadView();
};

//Process an error message sent via sockets
var processSocketError = function processSocketError(data) {
  handleError(data.error);
};

//Process a success message sent via sockets
var processSocketSuccess = function processSocketSuccess(data) {
  handleSuccess(data.message);
};

//Process the next part of the ad
var processNextAdEvent = function processNextAdEvent() {
  if (adTimeline.length <= 0) {
    return;
  }

  //Pull the next event off the ad event stack
  var adEvent = adTimeline.shift();

  var component = void 0;

  //Create a new ad component or target an existing one
  if (adComponents[adEvent.id]) {
    component = adComponents[adEvent.id];
  } else {
    switch (adEvent.type) {
      case "circle":
        component = new Circle({ x: adEvent.init.x, y: adEvent.init.y }, adEvent.init.size);
        adComponents[adEvent.id] = component;
        break;
      case "rectangle":
        component = new Rectangle({ x: adEvent.init.x, y: adEvent.init.y }, adEvent.init.width, adEvent.init.height);
        adComponents[adEvent.id] = component;
        break;
      case "image":
        var image = new Image(adEvent.init.image);

        //Create new graphic component
        component = new Graphic({ x: adEvent.init.x, y: adEvent.init.y }, image, adEvent.init.width, adEvent.init.height);

        image.onload = function () {
          adComponents[adEvent.id] = component;
        };
        image.src = adEvent.init.image;

        break;
      case "text":
        component = new Text({ x: adEvent.init.x, y: adEvent.init.y }, adEvent.init.text, adEvent.init.font, adEvent.init.size);
        adComponents[adEvent.id] = component;
        break;
      default:
        break;
    }
  }

  //Set properties for the target element
  if (adEvent.set) {
    var setKeys = Object.keys(adEvent.set);
    for (var i = 0; i < setKeys.length; i++) {
      var key = setKeys[i];
      component[key] = adEvent.set[key];
    }
  }

  //Animate the target element
  if (adEvent.animate) {
    switch (adEvent.animate.name) {
      case 'changeSize':
        component.bindAnimation(ChangeSize, adEvent.animate.props);
        break;
      case 'moveTo':
        console.log("yep");
        component.bindAnimation(MoveTo, adEvent.animate.props);
        break;
      case 'moveAndSize':
        component.bindAnimation(MoveAndSize, adEvent.animate.props);
        break;
      case 'changeRect':
        component.bindAnimation(ChangeRect, adEvent.animate.props);
        break;
      case 'rotate':
        component.bindAnimation(Rotate, adEvent.animate.props);
        break;
      case 'wobbleRotate':
        var wobbleForward = function wobbleForward() {
          component.bindAnimation(WobbleForward, adEvent.animate.props, wobbleBack);
        };
        var wobbleBack = function wobbleBack() {
          component.bindAnimation(WobbleBack, adEvent.animate.props, wobbleForward);
        };

        wobbleForward();

      default:
        break;
    }
  }
};

//Process ad data sent from the server
var processAd = function processAd(adData) {
  console.log(adData);

  adTimeline = [];
  adComponents = {};

  adAudio = new Audio(adData.audio);

  adTimeline = adData.adTimeline;

  adAudio.addEventListener('canplaythrough', function () {
    renderAd(true);
    showingAd = true;
    adAudio.play();
  });

  adAudio.addEventListener('ended', function () {
    payoutButton.disabled = false;
    showingAd = false;
  });
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

  var adModal = document.querySelector("#adModal");
  var subContractModal = document.querySelector("#subContractModal");

  if (adModal || subContractModal) {
    hideModal();
  }

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
