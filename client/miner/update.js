//The main update call which runs 60 times a second (ideally)
const update = () => {
  
  //Draw to the canvas (prep first, then display)
  if(showingAd){
    drawAd();
  } else {
    draw();
  }
  
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

//Process a mouse movement on the main display canvas
const processMouseMove = (e) => {
  const mousePos = getMouse(e);
  player.x = mousePos.x;
  player.y = mousePos.y;
  socket.emit('playerUpdate', { x: mousePos.x, y: mousePos.y });
};

//Process a mouse click confirmation from the server from a player
const processPlayerClick = (data) => {
  //Determine if the player is this client or another
  let ply;
  if(data.hash === hash){
    ply = player;
  } else {
    ply = players[data.hash];
  }
  
  //Return if the client has not been created yet
  if(!ply){
    return;
  }
  
  //Create a new effect circle and add it to the array (to be drawn and updated)
  const newEffectCircle = {
    x: ply.x,
    y: ply.y,
    r: ply.color.r,
    g: ply.color.g,
    b: ply.color.b,
    radius: 0,
    lineWidth: 20,
  }
  
  effectCircles.push(newEffectCircle);
};

//Recolor a player's pick
//Inspired by: https://stackoverflow.com/questions/24405245/html5-canvas-change-image-color
const recolor = (player, color) => {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = pickIcon.width;
  tempCanvas.height = pickIcon.height;
  
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(pickIcon, 0, 0);
  
  //Convert the image to color data
  const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const data = imageData.data;
  
  //Iterate over pixels and recolor image
  for(let i = 0; i < data.length; i += 4){
    data[i] = color.r;
    data[i + 1] = color.g;
    data[i + 2] = color.b;
  }
  
  //Put the image data back into the canvas and export the image for later use
  tempCtx.putImageData(imageData, 0, 0);
  
  //Create a new image
  const image = new Image();
  
  image.onload = () => {
    player.pick = image;
  }
  
  image.src = tempCanvas.toDataURL();
};

//Process player specific data sent from the server
const setupPlayer = (data) => {
  
  hash = data.hash;
  
  player = {
    x: -200,
    y: -200,
    hash: data.hash,
    color: data.color,
  };
  
  recolor(player, player.color);
}

//Process a player update
const updatePlayer = (data) => {
  let ply;
  
  //If the player is the current client, refer to the player object
  if(player.hash === data.hash){
    ply = player;
  } else {
    //If the player is a different client, make sure they exist
    if(!players[data.hash]){
      players[data.hash] = {
        color: data.color,
      };
      recolor(players[data.hash], data.color);
    }
    
    ply = players[data.hash];
  }
  
  ply.x = data.x;
  ply.y = data.y;
}

//Remove a player so that they aren't drawn and updated
const removePlayer = (data) => {
  //Ensure the player exists in the client's data
  if(players[data.hash]){
    players[data.hash] = null;
    delete players[data.hash];
  }
};

//Process a request from the server to spawn an asteroid
const spawnAsteroid = (data) => {
  const location = {x: prepCanvas.width / 2, y: prepCanvas.height / 2};
  asteroid = new Asteroid(data.asteroid, location);
  
  //Reset gamespace
  effectCircles = [];
  players = [];
};

//Process a request from the server to update the asteroid
const updateAsteroid = (data) => {
  if(!asteroid){
    return;
  }
  
  asteroid.updateVals(data.asteroid);
  renderProgressPanel(asteroid.progress, asteroid.toughness);
};

//Process a request from the server to update the player's account details
const updateAccount = (data) => {
  //Iterate through the sent account keys and update the client's account object
  const updateKeys = Object.keys(data);
  for(let i = 0; i < updateKeys.length; i++){
    const key = updateKeys[i];
    account[key] = data[key];
  }
  
  //Refresh the view in case relevant data has changed
  loadView();
};

//Process an error message sent via sockets
const processSocketError = (data) => {
  handleError(data.error);
};

//Process a success message sent via sockets
const processSocketSuccess = (data) => {
  handleSuccess(data.message);
};

//Process the next part of the ad
const processNextAdEvent = () => {
  if(adTimeline.length <= 0){
    return;
  }
  
  //Pull the next event off the ad event stack
  const adEvent = adTimeline.shift();
  
  let component;
  
  //Create a new ad component or target an existing one
  if(adComponents[adEvent.id]){
    component = adComponents[adEvent.id];
  } else {
    switch(adEvent.type){
      case "circle":
        component = new Circle({x: adEvent.init.x, y: adEvent.init.y}, adEvent.init.size);
        adComponents[adEvent.id] = component;
        break;
      case "rectangle":
        component = new Rectangle({ x: adEvent.init.x, y: adEvent.init.y },
          adEvent.init.width,
          adEvent.init.height,
        );
        adComponents[adEvent.id] = component;
        break;
      case "image":
        const image = new Image(adEvent.init.image);
        
        //Create new graphic component
        component = new Graphic(
          {x: adEvent.init.x, y: adEvent.init.y},
          image,
          adEvent.init.width,
          adEvent.init.height
        );
        
        image.onload = () => {
          adComponents[adEvent.id] = component;
        };
        image.src = adEvent.init.image;
        
        break;
      case "text":
        component = new Text(
          {x: adEvent.init.x, y: adEvent.init.y},
          adEvent.init.text, 
          adEvent.init.font,
          adEvent.init.size,
        );
        adComponents[adEvent.id] = component;
        break;
      default:
        break;
    }
  }
  
  //Set properties for the target element
  if(adEvent.set){
    const setKeys = Object.keys(adEvent.set);
    for(let i = 0; i < setKeys.length; i++){
      const key = setKeys[i];
      component[key] = adEvent.set[key];
    }
  }
  
  //Animate the target element
  if(adEvent.animate){
    switch(adEvent.animate.name){
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
        const wobbleForward = () => {
          component.bindAnimation(WobbleForward, adEvent.animate.props, wobbleBack);
        };
        const wobbleBack = () => {
          component.bindAnimation(WobbleBack, adEvent.animate.props, wobbleForward);
        };
        
        wobbleForward();
        
      default:
        break;
    }
  }
};

//Process ad data sent from the server
const processAd = (adData) => {
  console.log(adData);
  
  adTimeline = [];
  adComponents = {};
  
  adAudio = new Audio(adData.audio);
  
  adTimeline = adData.adTimeline;
  
  adAudio.addEventListener('canplaythrough', () => {
    renderAd(true);
    showingAd = true;
    adAudio.play();
  });
  
  adAudio.addEventListener('ended', () => {
    payoutButton.disabled = false;
    showingAd = false;
  });
};