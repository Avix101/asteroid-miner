//The main update call which runs 60 times a second (ideally)
const update = () => {
  
  //Draw to the canvas (prep first, then display)
  draw();
  
  //Request another animation frame for updating the client
  animationFrame = requestAnimationFrame(update);
};