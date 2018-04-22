//Canvas variables
let canvas, ctx, prepCanvas, prepCtx;
let adCanvas, adCtx;
const aspectRatio = 16 / 9;
const percentageOfScreenWidth = 0.6;

//Variables to handle ads
let adTimeline = [];
let adComponents = {};
let showingAd = false;
let adAudio;

//Static image files
let galaxyBg;

//Variables to manage socket
let socket, hash;

//Variables to handle update calls
let animationFrame;

//Variables relating to gamestate
let asteroid;

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
  }
};

//Load the requested React view
const loadView = () => {
  //Find the page's hash
  const hash = window.location.hash;
  pageView = hash;
  
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