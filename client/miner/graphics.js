let effectCircles = [];

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

//Draws a player's pick on screen
const drawPick = (context, ply) => {
  
  if(!ply.pick){
    return;
  }
  
  context.save();
  
  context.drawImage(
    ply.pick,
    ply.x,
    ply.y,
    pickIcon.width,
    pickIcon.height,
  );
  
  context.restore();
};

//Draws and updates effect circles
const drawAndUpdateEffectCircles = (context) => {
  context.save();
  
  //Iterate over each effect circle and update / draw
  for(let i = 0; i < effectCircles.length; i++){
    const circle = effectCircles[i];
    
    context.strokeStyle = `rgb(${circle.r}, ${circle.g}, ${circle.b})`;
    context.lineWidth = circle.lineWidth;
    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    context.stroke();
    
    circle.radius += circle.speed;
    circle.lineWidth -= 0.3;
    
    if(circle.lineWidth <= 0){
      effectCircles.splice(i, 1);
      i--;
    }
  }
  
  context.restore();
};

//Call to draw and update gems if there are any
const drawAndUpdateGems = (cvs, context) => {
  //Iterate over each gem
  for(let i = 0; i < gems.length; i++){
    const gem = gems[i];
    
    //Update the gem's position
    gem.x += gem.vector.x;
    gem.y += gem.vector.y;
    
    //Slow the gem down
    gem.vector = {
      x: gem.vector.x * 0.98,
      y: gem.vector.y * 0.98,
    };
    
    //Rotate the gem
    gem.displayAngle += gem.angleSpeed; 
  
    //Keep the gem within the bounds of the canvas
    if(gem.x < 50){
      gem.vector.x *= -1;
      gem.x = 50;
    } else if(gem.x > cvs.width - 50){
      gem.vector.x *= -1;
      gem.x = cvs.width - 50;
    }
    
    if(gem.y < 50){
      gem.vector.y *= -1;
      gem.y = 50;
    } else if(gem.y > cvs.height - 50){
      gem.vector.y *= -1;
      gem.y = cvs.height - 50;
    }
    
    //Draw the gem
    context.save();
    context.translate(gem.x - 25, gem.y - 25);
    context.rotate(gem.displayAngle);
    context.drawImage(
      gem.image,
      0,
      0,
      gem.image.width,
      gem.image.height,
      -25,
      -25,
      50,
      50
    );
    context.restore();
  }
};

//The main call to draw everything to the prep canvas
const draw = () => {
  
  //Clear the prep canvas
  clearCanvas(prepCanvas, prepCtx);
  
  //Draw stuff to the prep canvas
  
  prepCtx.filter = `hue-rotate(${player.color}deg)`;
  
  //If the background image has loaded, draw it to the background of the prep canvas
  if(galaxyBg){
    prepCtx.drawImage(galaxyBg, 0, 0, prepCanvas.width, prepCanvas.height);
  }
  
  //Draw and update the asteroid
  drawAndUpdateAsteroid();
  
  //Draw and update gems
  drawAndUpdateGems(prepCanvas, prepCtx);
  
  //Draw all players' picks
  drawPick(prepCtx, player);
  const playerKeys = Object.keys(players);
  for(let i = 0; i < playerKeys.length; i++){
    drawPick(prepCtx, players[playerKeys[i]]);
  }
  
  //Draw and update player effect circles
  drawAndUpdateEffectCircles(prepCtx);
  
  //Draw the prep canvas to the resized frame of the display canvas
  displayFrame(canvas, ctx);
};

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