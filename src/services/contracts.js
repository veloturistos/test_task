const { Op } = require('sequelize');
const { Contract } = require('../model');

//return the contract only if it belongs to the profile calling
async function getContractById(id, userId) {
  return Contract.findOne({
    where: {
      id: id,
      [Op.or]: [
        { ClientId: userId },
        { ContractorId: userId }
      ]
    }
  });
}

// Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.
async function getNonTerminatedUserContracts(userId) {
  return Contract.findAll({
    where: {
      [Op.or]: [
        { ClientId: userId },
        { ContractorId: userId }
      ],
      status: { [Op.ne]: 'terminated' },
    },
  });
}

module.exports = { 
  getContractById, 
  getNonTerminatedUserContracts 
};