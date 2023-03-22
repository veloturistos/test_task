const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const router = require('./router/router');

const log4js = require('log4js');
log4js.configure({
    appenders: { 'logging': { type: 'console' } },
    categories: { default: { appenders: ['logging'], level: 'all' } }
});
const logger = log4js.getLogger('logging');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.use(router);

app.use(function(req, res) {
  return res.status(404).send({url: req.originalUrl + ' not found'})
});

app.use(function(err, req, res, next) {
  logger.error(err.code + ' ' + err.message);
  res.status(err.code)
  return res.json({
    status : err.code, 
    message: err.message 
  });
});

module.exports = {
  app, logger
};
