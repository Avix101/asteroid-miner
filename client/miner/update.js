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
      case 'expandCircle':
        component.bindAnimation(ExpandCircle, adEvent.animate.props);
        break;
      case 'expandImage':
        component.bindAnimation(ExpandImage, adEvent.animate.props);
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