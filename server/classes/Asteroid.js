// Import models
const models = require('./../models');

const { Account } = models;
const { SubContract } = models;

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

      // Delete all uncompleted sub contracts
      // Also check against owner of sub contract(for partner cases)
      return SubContract.SubContractModel.findSubContractsOf(
        this.contract._id,
        (er2, subContracts) => {
          if (er2 || !subContracts) {
            return;
          }

          // Credit contract owner this sub contract funds that weren't utilized
          for (let i = 0; i < subContracts.length; i++) {
            const subContract = subContracts[i];

            const keys = Object.keys(subContract.rewards);
            for (let j = 0; j < keys.length; j++) {
              const key2 = keys[j];
              account.bank[key2] += subContract.rewards[key2];
            }

            // Destroy the subContract
            subContract.remove();
          }

          // Save account
          account.markModified('bank');
          account.save();
          this.contract.remove();
        },
      );
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
