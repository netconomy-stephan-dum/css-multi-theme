import express, { Application } from 'express';
import compression from 'compression';
import applyDevMiddleware from './development';

const createApp = (env: Record<string, string | undefined>): Application => {
  const { ASSET_PATH = `${process.cwd()}/dist/assets`, ASSET_ROUTE = '/assets', NODE_ENV } = env;
  const isProd = NODE_ENV === 'production';
  const app = express();

  app.use(compression());

  app.use(ASSET_ROUTE, express.static(ASSET_PATH));

  if (!isProd) {
    applyDevMiddleware(app);
  }
  return app;
};

export default createApp;
