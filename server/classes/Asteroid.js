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
      x: 660,
      y: 240,
      width: 600,
      height: 600,
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
    const shares = {};

    // Find the owner account and give them their rewards
    Account.AccountModel.findById(this.contract.ownerId, (err, acc) => {
      if (err || !acc) {
        return this.contract.remove();
      }

      const account = acc;
      const rewardKeys = Object.keys(this.rewards);

      console.dir(this.contract._doc);

      // If it's not a partner contract then it is a regular
      // contract with the possibility for sub-contracts.
      if (!this.contract._doc.partners) {
        // Give the owner their rewards
        for (let i = 0; i < rewardKeys.length; i++) {
          const key = rewardKeys[i];
          account.bank[key] += this.rewards[key];
        }
        console.log('Sub Contract');
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
      }
      // If we made it this far then it's a partner contract

      // Owner gets at least 1/4 shares
      shares[this.contract.ownerId] = {
        id: this.contract.ownerId,
        shares: 1,
      };

      // For each partner, determine how many shares they had.
      for (let i = 0; i < this.contract._doc.partners.length; i++) {
        // If partner hasn't been added, add it with a share of 1
        if (!shares[this.contract._doc.partners[i]]) {
          shares[this.contract._doc.partners[i]] = {
            id: this.contract._doc.partners[i],
            shares: 1,
          };
        } else {
          shares[this.contract._doc.partners[i]].shares += 1;
        }
      }

      const sharesKeys = Object.keys(shares);

      // For each player with shares, distribute rewards
      for (let i = 0; i < sharesKeys.length; i++) {
        const shareKey = sharesKeys[i];

        Account.AccountModel.findById(shares[shareKey].id, (er3, partnerAcc) => {
          if (er3 || !partnerAcc) {
            return;
          }

          console.log(partnerAcc);

          const partnerAccount = partnerAcc;

          for (let z = 0; z < rewardKeys.length; z++) {
            const key = rewardKeys[z];
            partnerAccount.bank[key] +=
                Math.ceil(this.rewards[key] * (shares[shareKey].shares / 4));
          }

          partnerAccount.markModified('bank');
          partnerAccount.save();
        });
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
