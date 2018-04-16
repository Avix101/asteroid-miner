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
const displayFrame = () => {
  
  //If the display canvas doesn't exist, don't draw to it
  if(!canvas){
    return;
  }
  
  //Clear the display canvas, draw from the prep canvas
  clearCanvas(canvas, ctx);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    prepCanvas,
    0,
    0,
    prepCanvas.width,
    prepCanvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.restore();
};

const draw = () => {
  
  //Clear the prep canvas
  clearCanvas(prepCanvas, prepCtx);
  
  //Draw stuff to the prep canvas
  
  //Draw the prep canvas to the resized frame of the display canvas
  displayFrame();
};