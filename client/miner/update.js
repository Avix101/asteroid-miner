//The main update call which runs 60 times a second (ideally)
const update = () => {
  
  //Draw to the canvas (prep first, then display)
  draw();
  
  //Request another animation frame for updating the client
  animationFrame = requestAnimationFrame(update);
};

//Get the mouse position relative to the size of the prep canvas canvas
const getMouse = (e) => {
  const rect = canvas.getBoundingClientRect();
  const widthRatio = rect.width / prepCanvas.width;
  const heightRatio = rect.height / prepCanvas.height;
  return {
    x: (e.clientX - rect.left) / widthRatio,
    y: (e.clientY - rect.top) / heightRatio,
  }
};

//Process a mouse click on the main display canvas
const processClick = (e) => {
  const mousePos = getMouse(e);
  socket.emit('click', { mouse: mousePos });
};

//Process a request from the server to spawn an asteroid
const spawnAsteroid = (data) => {
  const location = {x: prepCanvas.width / 2, y: prepCanvas.height / 2};
  asteroid = new Asteroid(data.asteroid, location);
};

//Process a request from the server to update the asteroid
const updateAsteroid = (data) => {
  if(!asteroid){
    return;
  }
  
  asteroid.updateVals(data.asteroid);
  renderProgressPanel(asteroid.progress, asteroid.toughness);
};