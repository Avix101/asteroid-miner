//Animates a change in size
function ChangeSize(amount, duration){
  const sizeAnimation = new Animation(
    {
      begin: 0,
      loop: false,
      timeToFinish: duration,
      propsBegin: {size: this.size},
      propsEnd: {size: this.size + amount},
    }
  );
  return sizeAnimation;
};

//Animates a movement
function MoveTo(x, y, duration){
  const moveAnimation = new Animation(
    {
      begin: 0,
      loop: false,
      timeToFinish: duration,
      propsBegin: {x: this.x, y: this.y},
      propsEnd: { x, y },
    }
  );
  return moveAnimation;
}

//Animates movement and size change
function MoveAndSize(x, y, size, duration){
  const mixedAnimation = new Animation(
    {
      begin: 0,
      loop: false,
      timeToFinish: duration,
      propsBegin: {x: this.x, y: this.y, size: this.size},
      propsEnd: { x, y, size },
    }
  );
  return mixedAnimation;
}

//Animate an image to expand
function ExpandImage(width, height, duration){
  const expandAnimation = new Animation(
    {
      begin: 0,
      loop: false,
      timeToFinish: duration,
      propsBegin: {width: this.width, height: this.height},
      propsEnd: { width, height }
    }
  );
  return expandAnimation;
};

//Animate something to rotate
function Rotate(speed){
  const newAngle = (this.radians + Math.PI) % (Math.PI * 2);
  const rotateAnimation = new Animation(
    {
      begin: 0,
      loop: true,
      timeToFinish: speed,
      propsBegin: { radians: this.radians },
      propsEnd: { radians: newAngle },
    }
  );
  return rotateAnimation;
};

//Animate a small rotation forward
function WobbleForward(amount, speed){
  const newAngle = this.radians + amount;
  const rotateAnimation = new Animation(
    {
      begin: 0,
      loop: false,
      timeToFinish: speed,
      propsBegin: { radians: this.radians },
      propsEnd: { radians: newAngle },
    }
  );
  return rotateAnimation;
};

//Animate a small rotate backwards
function WobbleBack(amount, speed){
  const newAngle = this.radians - amount;
  const rotateAnimation = new Animation(
    {
      begin: 0,
      loop: false,
      timeToFinish: speed,
      propsBegin: { radians: this.radians },
      propsEnd: { radians: newAngle },
    }
  );
  return rotateAnimation;
};