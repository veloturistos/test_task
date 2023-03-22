const {app, logger} = require('./app');

init();

async function init() {
  try {
    app.listen(3001, () => {
      logger.info('Express App Listening on Port 3001');
    });
  } catch (error) {
    logger.error(`An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}
