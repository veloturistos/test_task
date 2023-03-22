const { Router } = require('express');
const asyncHandler = require('express-async-handler');

const { getProfile } = require('../middleware/getProfile');
const { getNonTerminatedUserContracts, getContractById } = require('../services/contracts');
const { getUnpaidJobs, payJob } = require('../services/jobs');
const { depositMoney } = require('../services/balances');
const { getBestClients, getBestProfession } = require('../services/admin');
const HttpError = require('../helper/httpError');

const router = new Router();


router.get('/contracts/:id', getProfile, asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) {
      throw new HttpError(400, 'id not a Number')
    }
    const userId = req.profile.id;

    const contract = await getContractById(id, userId);

    if (!contract) {
      return res.status(404).end();
    }

    res.json(contract);
  })
);

router.get('/contracts', getProfile, asyncHandler(async (req, res) => {
    const userId = req.profile.id;
    const contracts = await getNonTerminatedUserContracts(userId);

    res.json(contracts);
  })
);

router.get('/jobs/unpaid', getProfile, asyncHandler(async (req, res) => {
    const userId = req.profile.id;
    const jobs = await getUnpaidJobs(userId);

    res.json(jobs);
  })
);

router.post('/jobs/:job_id/pay', getProfile, asyncHandler(async (req, res) => {
    const jobId = req.params.job_id;
    if (isNaN(jobId)) {
      throw new HttpError(400, 'job_id not a Number')
    }
    const clientId = req.profile.id;

    const updatedJob = await payJob(jobId, clientId);

    res.json(updatedJob);
  })
);

router.post('/balances/deposit/:userId', asyncHandler(async (req, res) => {
    const clientId = req.params.userId;
    if (isNaN(clientId)) {
      throw new HttpError(400, 'userId not a Number')
    }
    const { amount } = req.body;

    const profile = await depositMoney(clientId, amount);

    res.json(profile);
  })
);

router.get('/admin/best-profession', asyncHandler(async (req, res) => {
    const { start, end } = req.query;
    const bestProfession = await getBestProfession(start, end);

    res.json(bestProfession);
  })
);

router.get('/admin/best-clients', asyncHandler(async (req, res) => {
    const { start, end, limit } = req.query;
    const bestClients = await getBestClients(start, end, limit);

    res.json(bestClients);
  })
);

module.exports = router;