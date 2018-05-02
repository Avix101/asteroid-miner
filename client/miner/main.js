//Canvas variables
let canvas, ctx, prepCanvas, prepCtx;
let adCanvas, adCtx;
const aspectRatio = 16 / 9;
const percentageOfScreenWidth = 0.45;

//Variables to handle ads
let adTimeline = [];
let adComponents = {};
let showingAd = false;
let adAudio;

//Static image files
let pickIcon;
let rubbleIcon;
let galaxyBg;
let gbIcon;
let ironIcon;
let copperIcon;
let sapphireIcon;
let emeraldIcon;
let rubyIcon;
let diamondIcon;

//Variables to manage socket
let socket, hash;
let account = {
  bank: {
    gb: 0,
    iron: 0,
    copper: 0,
    sapphire: 0,
    emerald: 0,
    ruby: 0,
    diamond: 0,
  }
};

//Variables to handle update calls
let animationFrame;

//Variables relating to gamestate
let asteroid;
let gems = [];
let player = {
  x: -200,
  y: -200,
  color: { r: 0, g: 0, b: 0},
};
let players = {};
let subContract;
let mousePos = { x: -200, y: -200 };

//Current view
let pageView;

const NULL_FUNC = () => {};

//Calculate the appropriate viewport dimensions
const calcDisplayDimensions = () => {
  const width = window.innerWidth * percentageOfScreenWidth;
  const height = width / aspectRatio;
  
  return {
    width,
    height,
  };
};

//Resize the display canvas if its currently onscreen
const resizeGame = (e) => {
  if(pageView === "#miner"){
    const dimensions = calcDisplayDimensions();
    renderGame(dimensions.width, dimensions.height);
  } else if(showingAd){
    renderAd(true);
  }
};

//Load the requested React view
const loadView = () => {
  //Find the page's hash
  const hash = window.location.hash;
  pageView = hash;
  
  //Render my contracts panel
  renderMyContractsPanel();
  
  //Render progress / info panel
  if(asteroid){
    renderProgressPanel(asteroid.progress, asteroid.toughness);
  } else {
    renderProgressPanel();
  }
  
  
  //Depending on the hash, render the main content
  switch(hash){
    case "#miner": {
      const dimensions = calcDisplayDimensions();
      renderGame(dimensions.width, dimensions.height);
      break;
    }
    case "#contracts": {
      renderContracts();
      break;
    }
    case "#market": {
      renderMarket();
      break;
    }
    case "#upgrades": {
      renderUpgrades();
      break;
    }
    case "#highscores": {
      renderHighscores();
      break;
    }
    case "#galaxy": {
      renderPayToWin();
      break;
    }
    case "#profile": {
      renderProfile();
      break;
    }
    default: {
      //Default to loading the miner window
      const dimensions = calcDisplayDimensions();
      renderGame(dimensions.width, dimensions.height);
      pageView = "#miner";
      break;
    }
  }
};

//Run this function when the page loads
const init = () => {
  
  //Update this every so often (can't be done via sockets, as the panel
  //reaches into various contracts (different game rooms)
  setInterval(() => {
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