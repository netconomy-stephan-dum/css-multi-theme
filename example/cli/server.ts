import createServer from './createServer';

const logger = console;
const app = createServer();
if (module.hot) {
  module.hot.accept(logger.error);
  module.hot.dispose(() => {
    logger.log('Restarting server...');
    app.close();
  });
}
