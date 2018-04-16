class Asteroid {
  constructor(data, location){
    //Data received from the server
    this.name = data.name;
    this.classname = data.classname;
    this.progress = data.progress;
    this.toughness = data.toughness;
    
    //Load asteroid image
    const image = new Image();
    
    image.onload = () => {
      this.image = image;
    };
    
    image.src = data.imageFile;
    
    //Animation / clientside only data
    this.x = location.x;
    this.y = location.y;
    this.radians = 0;
    this.rotateSpeed = -Math.random() * 0.01;
  }
  
  //Update properties of the asteroid
  update(){
    this.radians = (this.radians + this.rotateSpeed) % (2 * Math.PI);
  };
  
  //Update the asteroid according to changes made by the server
  updateVals(data){
    const keys = Object.keys(data);
    for(let i = 0; i < keys.length; i++){
      const key = keys[i];
      this[key] = data[key];
    }
  };
}