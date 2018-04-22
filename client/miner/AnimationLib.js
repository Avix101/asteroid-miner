function ExpandCircle(amount, duration){
  const expandAnimation = new Animation(
    {
      begin: 0,
      loop: false,
      timeToFinish: duration,
      propsBegin: {size: this.size},
      propsEnd: {size: this.size + amount},
    }
  );
  return expandAnimation;
};

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