const HttpError = require('../helper/httpError');

//Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
async function depositMoney(clientId, amount) {
    const result = await sequelize.transaction(async (t) => {
      const client = await Profile.findByPk(clientId, { transaction: t });

      if (!client || client.type !== 'client') {
        throw new HttpError(404, 'Client not found')
      }

      const unpaidSum = await getClientUnpaidJobsSum(clientId);
      const depositThreshold = unpaidSum * 0.25;

      if (amount > depositThreshold) {
        throw new HttpError(400, 'Deposit exceeds the threshold');
      }

      // drop floating fractions
      client.balance = parseFloat((client.balance + amount).toFixed(2));

      await client.save({ transaction: t });

      return client;
    });

  return result;

};


module.exports = {
  depositMoney
};