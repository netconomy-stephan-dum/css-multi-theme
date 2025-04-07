import express from 'express';
import compression from 'compression';
import path from 'node:path';
import reactDOM from 'react-dom/server';
import HTMLIndex from './HTMLIndex';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { ChunkExtractor } from '@loadable/server';
import ConfigContext from '@example/app/ConfigContext';

const PORT = 8114;
const logger = console;

const createServer = async () => {
  const App = (
    await import(
      /* webpackMode: "eager" */
      ROOT_MODULE_PATH
    )
  ).default;

  const app = express();

  app.use(compression());
  app.use(express.static(path.join(process.cwd(), 'dist/public'), { index: false }));
  app.use(async (request, response) => {
    const [rawTenantName] = request.hostname.split('.');
    const tenantName = rawTenantName === 'localhost' ? 'base' : rawTenantName;
    const extractor = new ChunkExtractor({
      entrypoints: ['main'],
      statsFile: `${process.cwd()}/dist/public/assets/${tenantName}/loadable-stats.json`,
    });
    const configContext = { port: PORT, tenantName };
    const html = reactDOM.renderToString(<HTMLIndex lang="de" title="someTitle" />);
    const layout = reactDOM.renderToString(
      extractor.collectChunks(
        <React.StrictMode>
          <ConfigContext.Provider value={configContext}>
            <StaticRouter location={request.path}>
              <App />
            </StaticRouter>
          </ConfigContext.Provider>
        </React.StrictMode>,
      ),
    );
    const head = [
      // `<script>window.assetsByChunkName = ${JSON.stringify(assetsByChunkName)}</script>`,
      extractor.getStyleTags(),
      extractor.getScriptTags(),
    ].join('');

    response.end('<!DOCTYPE html>' + html.replace('@@layout@@', layout).replace('@@head@@', head));
  });

  return app.listen(PORT, () => {
    logger.log(`server listening on: http://base.localhost:${PORT}`);
  });
};

(async () => {
  await createServer();
})();
