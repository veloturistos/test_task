const { Op } = require('sequelize');
const { Contract, Job, Profile, sequelize } = require('../model');
const HttpError = require('../helper/httpError');

// Retrieve unpaid jobs for a specific user
async function getUnpaidJobs(userId) {
  const unpaidJobs = Job.findAll({
    where: {
      [Op.or]: [
        { paid: false },
        { paid: null }
      ]
    },
    include: [
      {
        attributes: [],
        model: Contract,
        required: true,
        where: {
          [Op.or]: [
            { ContractorId: userId }, 
            { ClientId: userId }
          ],
          status: {
            [Op.eq]: 'in_progress'
          }
        }
      }
    ]
    
  });
  return unpaidJobs;
}

// Pay a job with a specific ID for a specific client ID
async function payJob(jobId, clientId) {
  const result = await sequelize.transaction(async (transaction) => {
    const job = await Job.findOne(
      {
        where: {
          id: jobId
        },
        include: [
          {
            model: Contract,
            required: true,
            attributes: ['ContractorId'],
            where: {
              ClientId: clientId
            }
          }
        ]
      },
      { transaction }
    );

    if (!job) {
      throw new HttpError(404, 'Job not found');
    }

    if (job.paid) {
      throw new HttpError(409, 'Job is already paid');
    }

    const [clientProfile, contractorProfile] = await Promise.all([
      Profile.findByPk(clientId, { transaction }),
      Profile.findByPk(job.Contract.ContractorId, {
        transaction
      }),
    ]);

    if (clientProfile.balance < job.price) {
      throw new HttpError(400, 'Insufficient funds');
    }

   
    clientProfile.balance = clientProfile.balance - job.price;
    contractorProfile.balance = contractorProfile.balance + job.price;
    job.paid = true;
    job.paymentDate = new Date().toISOString();

    await Promise.all([
      clientProfile.save({ transaction }),
      contractorProfile.save({ transaction }),
      job.save({ transaction })
    ]);

    return job;
  });

  return result;
}

module.exports = {
  getUnpaidJobs,
  payJob
};