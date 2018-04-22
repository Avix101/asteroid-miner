//Interpolate between two values given a ratio between 0 and 1
const lerp = (val1, val2, ratio) => {
  const component1 = (1 - ratio) * val1;
  const component2 = ratio * val2;
  return component1 + component2;
};

//Clear the given canvas
const clearCanvas = (cvs, context) => {
  context.clearRect(0, 0, cvs.width, cvs.height);
};

//Draw to the display canvas, which is dynamically resizable
const displayFrame = (cvs, context) => {
  
  //If the display canvas doesn't exist, don't draw to it
  if(!cvs){
    return;
  }
  
  //Clear the display canvas, draw from the prep canvas
  clearCanvas(cvs, context);
  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(
    prepCanvas,
    0,
    0,
    prepCanvas.width,
    prepCanvas.height,
    0,
    0,
    cvs.width,
    cvs.height
  );
  context.restore();
};

//Draw and update the asteroid, assuming there is one
const drawAndUpdateAsteroid = () => {
  if(!asteroid || !asteroid.image){
    return;
  }
  
  asteroid.update();
  prepCtx.save();
  
  prepCtx.translate(asteroid.x, asteroid.y);
  prepCtx.rotate(asteroid.radians);
  
  prepCtx.drawImage(
    asteroid.image,
    -asteroid.image.width / 2,
    -asteroid.image.height / 2,
  );
  
  prepCtx.restore();
};

//The main call to draw everything to the prep canvas
const draw = () => {
  
  //Clear the prep canvas
  clearCanvas(prepCanvas, prepCtx);
  
  //Draw stuff to the prep canvas
  
  //If the background image has loaded, draw it to the background of the prep canvas
  if(galaxyBg){
    prepCtx.drawImage(galaxyBg, 0, 0, prepCanvas.width, prepCanvas.height);
  }
  
  drawAndUpdateAsteroid();
  
  //Draw the prep canvas to the resized frame of the display canvas
  displayFrame(canvas, ctx);
};

const circle = new Circle(
  {
    x: 900,
    y: 600,
  },
  50
);

setTimeout(() => {
circle.bindAnimation(ExpandCircle, [500, 900]);
}, 50);

//The main call to draw ad related content to the ad canvas
const drawAd = () => {
  
  //Clear the prep canvas
  clearCanvas(prepCanvas, prepCtx);
  
  prepCtx.save();
  prepCtx.fillStyle = "salmon";
  prepCtx.fillRect(0, 0, prepCanvas.width, prepCanvas.height);
  
  //const adTime = adAudio.currentTime / adAudio.duration;
  const adTime = adAudio.currentTime * 1000;
  
  while(adTimeline.length > 0 && adTime >= adTimeline[0].trigger){
    processNextAdEvent();
  }
  
  const adComponentKeys = Object.keys(adComponents);
  for(let i = 0; i < adComponentKeys.length; i++){
    const key = adComponentKeys[i];
    adComponents[key].draw(prepCtx);
  }
  
  prepCtx.restore();
  
  //Draw to the ad canvas
  displayFrame(adCanvas, adCtx);
};