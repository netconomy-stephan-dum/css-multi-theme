import express, { Request, Response} from 'express';
import ssrMiddleware from './middleware';

const PORT = 9000;
const logger = console;

let middlewareFn: (request: Request, response: Response) => void;
if (module.hot) {
  module.hot.accept('./middleware', async () => {
    middlewareFn = (await import('./middleware')).default;
  });
}
const createServer = () => {
  const app = express();
  middlewareFn = ssrMiddleware;
  app.use((request, response) => {
    middlewareFn(request, response);
  });

  return app.listen(PORT, () => {
    logger.log(['server listening on:', `http://localhost:${PORT}`].join('\n'));
  });
};

export default createServer;
