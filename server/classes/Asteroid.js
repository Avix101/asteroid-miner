// Holds data pertaining to a partiuclar asteroid (including rewards)
class Asteroid {
  // Determine reward upon completion
  static calculateRewards(rewardChances) {
    const rewards = {};

    const rewardKeys = Object.keys(rewardChances);
    for (let i = 0; i < rewardKeys.length; i++) {
      const key = rewardKeys[i];
      const reward = rewardChances[key];
      rewards[key] = reward.min + Math.floor(Math.random() * (reward.max - reward.min));
    }

    return rewards;
  }

  // Creates the initial asteroid
  constructor(room, data) {
    this.room = room;
    this.name = data.name;
    this.classname = data.classname;
    this.imageFile = data.imageFile;
    this.progress = 0;
    this.toughness = data.template.toughness;
    this.rewards = Asteroid.calculateRewards(data.template.rewardChances);
  }

  // Bundles an asteroid's data to be sent to players
  getBundledData() {
    return {
      name: this.name,
      classname: this.classname,
      imageFile: this.imageFile,
      progress: this.progress,
      toughness: this.toughness,
    };
  }

  static getBundledDataFor(asteroid) {
    return {
      name: asteroid.name,
      classname: asteroid.classname,
      imageFile: asteroid.imageFile,
      progress: asteroid.progress,
      toughness: asteroid.toughness,
    };
  }

  // Get the asteroid's position (this is just guesswork- implement something better)
  static getBoundingRect() {
    return {
      x: 910,
      y: 490,
      width: 100,
      height: 100,
    };
  }

  // Mine an asteroid by a given amount (progress towards completion)
  mine(amount) {
    this.progress += amount;
  }
}

module.exports = Asteroid;
