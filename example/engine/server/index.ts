import express from 'express';
import compression from 'compression';

const app = express();

const {
  ASSET_PATH = `${process.cwd()}/dist/assets`,
  ASSET_ROUTE = '/assets',
  IS_PROD = true,
} = process.env;

app.use(compression());

app.use(ASSET_ROUTE, express.static(ASSET_PATH));

if (!IS_PROD) {
}
