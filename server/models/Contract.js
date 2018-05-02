const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let ContractModel = {};

// Construct a contract schema
const ContractSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  asteroid: {
    type: Object,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// A static function that finds all contracts belonging to a user
ContractSchema.statics.findContractsFor = (id, callback) => {
  const search = {
    ownerId: id,
  };

  return ContractModel.find(search, callback);
};

// A static function that retrieves a contract by its id
ContractSchema.statics.findById = (id, callback) => {
  const search = {
    _id: id,
  };

  return ContractModel.findOne(search, callback);
};

ContractModel = mongoose.model('Contract', ContractSchema);

module.exports.ContractModel = ContractModel;
module.exports.ContractSchema = ContractSchema;
