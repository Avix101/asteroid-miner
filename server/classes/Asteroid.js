// Import models
const models = require('./../models');

const { Account } = models;

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
  constructor(room, data, firstBuild) {
    this.room = room;

    if (firstBuild) {
      this.name = data.name;
      this.classname = data.classname;
      this.imageFile = data.imageFile;
      this.progress = 0;
      this.toughness = data.template.toughness;
      this.rewards = Asteroid.calculateRewards(data.template.rewardChances);
    } else {
      this.name = data.asteroid.name;
      this.contract = data;
      this.classname = data.asteroid.classname;
      this.imageFile = data.asteroid.imageFile;
      this.progress = data.asteroid.progress;
      this.toughness = data.asteroid.toughness;
      this.rewards = data.asteroid.rewards;
    }
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

  // Save the asteroid's contract details (progress)
  save() {
    if (this.contract) {
      this.contract.asteroid.progress = this.progress;
      this.contract.markModified('asteroid');
      this.contract.save();
    }
  }

  // Distribute the rewards when the asteroid is finished
  distributeRewards() {
    // Find the owner account and give them their rewards
    Account.AccountModel.findById(this.contract.ownerId, (err, acc) => {
      if (err || !acc) {
        return this.contract.remove();
      }

      const account = acc;

      // Give the owner their rewards
      const rewardKeys = Object.keys(this.rewards);
      for (let i = 0; i < rewardKeys.length; i++) {
        const key = rewardKeys[i];
        account.bank[key] += this.rewards[key];
      }
      account.markModified('bank');
      account.save();
      return this.contract.remove();
    });
  }

  // Mine an asteroid by a given amount (progress towards completion)
  mine(amount) {
    // Don't allow rewards to be distributed twice
    if (this.progress >= this.toughness) {
      return;
    }

    this.progress += amount;

    if (this.progress >= this.toughness) {
      this.progress = this.toughness;
      this.distributeRewards();
    } else {
      this.save();
    }
  }
}

module.exports = Asteroid;
