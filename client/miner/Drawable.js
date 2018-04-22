//The animatable class bundles an object's info into a single object for rendering
class Animatable {
  constructor(location, properties){
    this.x = location.x;
    this.y = location.y;
    
    //Set the animatable's properties
    const propKeys = Object.keys(properties);
    for(let i = 0; i < propKeys.length; i++){
        const key = propKeys[i];
        this[key] = properties[key];
    }
    
    this.color = "#000000";
    this.radians = 0;
    this.animation = null;
    this.animCallback = null;
    this.opacity = 1;
  };
  
  //Animations can be bound to an animatable, in which case the object will animate when updated
  bindAnimation(Animation, args, callback){
    
    //Start the animation at the time of bind
    this.animation = Animation.apply(this, args);
    this.animation.bind(new Date().getTime());
    
    //If the animation comes with a callback, set the callback
    if(callback){
      this.animCallback = callback;
    } else {
      this.animCallback = null;
    }
  };
  
  //Cancel an animatable's animation
  cancelAnimation(){
    delete this.animation;
    this.animation = null;
  };
  
  //End the animatable's animation (same as cancel, but calls the animation callback)
  endAnimation(){
    this.cancelAnimation();
    if(this.animCallback){
      this.animCallback(this);
    }
  };
  
  //Determine if the animatable is ready to animate
  readyToAnimate(){
    return this.animation === null;
  };
  
  //Visually flip the animatable
  flipImage(){
    this.radians = (this.radians + Math.PI) % (2 * Math.PI);
  }
  
  //Update the animatable based on its current animation
  update(currentTime){
    if(this.animation){
      //Update the animation and copy over the new values
      this.animation.update(currentTime);
      this.animation.copyVals(this);
      
      if(this.animation.complete){
        this.endAnimation();
      }
      
      return true;
    }
    return this.animation !== null;
  };
}

//The circle class extends the animatable class
//Every circle has a size attribute
class Circle extends Animatable {
  constructor(location, size){
    super(location, { size });
  }
  
  //Method to draw a circle
  draw(context){
    context.fillStyle = this.color;
    
    const time = new Date().getTime();
    this.update(time);
    
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    context.fill();
  }
};

//The graphic class is basically an image with some extra code added on for drawing
class Graphic extends Animatable {
  constructor(location, image, width, height){
    super(location, { image, width, height });
  }
  
  //Method to draw image
  draw(context){
    const time = new Date().getTime();
    this.update(time);
    
    context.save();
    const x = -this.width / 2;
    const y = -this.height / 2;
    context.translate(this.x, this.y);
    context.rotate(this.radians);
    context.drawImage(this.image, x, y, this.width, this.height);
    context.restore();
  }
};

//The text class draws handles drawing text
class Text extends Animatable {
  constructor(location, text, font, size){
    super(location, { text, font, size });
  }
  
  //Method to draw text
  draw(context){
    const time = new Date().getTime();
    this.update(time);
    
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${this.size}pt ${this.font}`;
    context.fillStyle = this.color;
    context.fillText(this.text, this.x, this.y);
  }
};