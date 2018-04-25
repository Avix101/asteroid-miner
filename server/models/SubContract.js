const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Kind of like a contract, but smaller
let SubContractModel = {};

// Construct a sub contract schema
const SubContractSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  subContractorId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  asteroid: {
    type: Object,
    required: true,
  },
  accepted: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    min: 0,
    default: 0,
  },
  clicks: {
    type: Number,
    required: true,
  },
  rewards: {
    type: Object,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// A static function that finds all open sub contracts
SubContractSchema.statics.findAllOpenSubContracts = (callback) => {
  const search = {
    accepted: false,
  };

  return SubContractModel.find(search, callback);
};

// A static function that finds all sub contracts belonging to a user
SubContractSchema.statics.findSubContractsOwnedBy = (id, callback) => {
  const search = {
    ownerId: id,
  };

  return SubContractModel.find(search, callback);
};

// A static function that finds all sub contracts belonging to an original contract
SubContractSchema.statics.findSubContractsOf = (id, callback) => {
  const search = {
    contractId: id,
  };

  return SubContractModel.find(search, callback);
};

// A static function that finds all sub contracts for a user
SubContractSchema.statics.findSubContractsFor = (id, callback) => {
  const search = {
    subContractorId: id,
  };

  return SubContractModel.find(search, callback);
};

// A static function to return a specific sub contract
SubContractSchema.statics.findById = (id, callback) => {
  const search = {
    _id: id,
  };

  return SubContractModel.findOne(search, callback);
};

SubContractModel = mongoose.model('SubContract', SubContractSchema);

module.exports.SubContractModel = SubContractModel;
module.exports.SubContractSchema = SubContractSchema;
