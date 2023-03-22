const { Op, col, fn  } = require('sequelize');
const { Contract, Job, Profile, sequelize } = require('../model');

//Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time
async function getBestProfession(startDate, endDate) {
  const profilesWithEarnedMoney = await Profile.findAll({
    attributes: ['profession', [fn('SUM', col('price')), 'earned']],
    include: [
      {
        model: Contract,
        as: 'Contractor',
        attributes: [],
        required: true,
        include: [
          {
            model: Job,
            required: true,
            attributes: [],
            where: {
              paid: true,
              paymentDate: {
                [Op.gte]: startDate,
                [Op.lte]: endDate
              }
            }
          }
        ]
      }
    ],
    where: {
      type: 'contractor',
    },
    group: ['profession'],
    order: [[col('earned'), 'DESC']],
    limit: 1,
    subQuery: false,
  });

  if (!profilesWithEarnedMoney.length) {
    return {message : 'jobs not found!'};
  }

  const result = profilesWithEarnedMoney[0].get({ plain: true });

  return {
    profession: result.profession,
    paid: result.earned,
  };
}

//returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
async function getBestClients(startDate, endDate, limit = 2) {
  const results = await Job.findAll({
    attributes: [[fn('sum', col('price')), 'paid']],
    order: [[fn('sum', col('price')), 'DESC']],
    group: ['Contract.Client.id'],
    limit,
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [startDate, endDate]
      }
    },
    include: [
      {
        model: Contract,
        attributes: ['id'],
        include: [
          {
            model: Profile,
            as: 'Client',
            where: { type: 'client' },
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      }
    ]
  });

  return results.map((groupedJobs) => ({   
    id: groupedJobs.Contract.Client.id,
    fullName: `${groupedJobs.Contract.Client.firstName} ${groupedJobs.Contract.Client.lastName}`,
    paid: groupedJobs.paid
  }));
}

module.exports = {
  getBestProfession,
  getBestClients,
};