const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let PartnerContractModel = {};

// Construct a contract schema
const PartnerContractSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  cost: {
    type: Number,
  },
  maximumPartners: {
    type: Number,
    required: true,
  },
  partners: {
    type: Array,
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
PartnerContractSchema.statics.findContractsFor = (id, callback) => {
  const search = {

    $or: [
      { ownerId: id },
      { partners: id },
    ],
    //    partners: id,
    // ownerId: id,

  };

  return PartnerContractModel.find(search, callback);
};

// Finds  partner contracts the user participates in and isn't the direct owner of.
PartnerContractSchema.statics.findReadyPartnerContractsFor = (id, callback) => {
  const objId = mongoose.Types.ObjectId(id);
  const search = {
    $and: [
      {
        $or: [
          { ownerId: id },
          { partners: objId },
        ],
      },
      {
        partners: { $size: 3 },
      },
    ],
  };

  return PartnerContractModel.find(search, callback);
};

// PartnerContractSchema.statics.findOpenContracts = (callback) => {
//  const openContracts = [];
//  PartnerContractModel.find({}, (err, docs) => {
//    for (let i = 0; i < docs.length; i++) {
//      if (docs[i]._doc.partners.length < docs[i]._doc.maximumPartners) {
//        openContracts.push(docs[i]._doc);
//      }
//    }
//
//    return callback(err, openContracts);
//  });
// };

PartnerContractSchema.statics.findOpenContracts = callback =>
  PartnerContractModel.find({}, callback);

PartnerContractSchema.statics.addPartner = (userId, contractId, callback) => {
  const search = {
    _id: contractId,
  };

  PartnerContractModel.find(search, (err, docs) => {
    console.dir(docs[0]._doc.partners);
    if (docs[0]._doc.partners.length < docs[0]._doc.maximumPartners) {
      return PartnerContractModel.update({ $push: { partners: userId } }, callback);
    }
    return callback(err, {});
  });
};

// A static function that retrieves a contract by its id
PartnerContractSchema.statics.findById = (id, callback) => {
  const search = {
    _id: id,
  };

  return PartnerContractModel.findOne(search, callback);
};

PartnerContractModel = mongoose.model('PartnerContract', PartnerContractSchema);

module.exports.PartnerContractModel = PartnerContractModel;
module.exports.PartnerContractSchema = PartnerContractSchema;
