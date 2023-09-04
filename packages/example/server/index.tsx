import express from 'express';
import compression from 'compression';
import assetsByTenant from 'multi-tenants/manifestByTenant';
import HTMLIndex from './HTMLIndex';
import Layout from '@example/app/components/Layout';
import Routes from '@example/app/Routes';
import reactDOM from 'react-dom/server';
import React from 'react';
import { ChunkExtractor } from '@loadable/server';
import path from 'node:path';
import { StaticRouter } from 'react-router-dom';

const PORT = 8114;
const logger = console;

const createServer = () => {
  const app = express();

  app.use(compression());
  app.use(express.static(path.join(process.cwd(), 'dist'), { index: false }));
  app.use(async (request, response) => {
    const [rawTenantName] = request.hostname.split('.');
    const tenantName = rawTenantName === 'localhost' ? 'base' : rawTenantName;

    const assetsByChunkName = (
      await import(
        /* webpackIgnore: true */ `file://${process.cwd()}/dist${assetsByTenant[tenantName]}`
      )
    ).default;

    const extractor = new ChunkExtractor({
      entrypoints: ['main'],
      statsFile: `${process.cwd()}/dist/assets/${tenantName}/loadable-stats.json`,
    });

    const html = reactDOM.renderToString(<HTMLIndex lang="de" title="someTitle" />);

    const layout = reactDOM.renderToString(
      extractor.collectChunks(
        <StaticRouter location={request.url}>
          <Layout>
            <Routes />
          </Layout>
        </StaticRouter>,
      ),
    );

    const head = [
      `<script>window.assetsByChunkName = ${JSON.stringify(assetsByChunkName)}</script>`,
      extractor.getStyleTags(),
      extractor.getScriptTags(),
    ].join('');

    response.send(html.replace('@@layout@@', layout).replace('@@head@@', head));
  });

  return app.listen(PORT, () => {
    logger.log(['server listening on:', `http://localhost:${PORT}`].join('\n'));
  });
};
(async () => {
  const server = await createServer();
  if (module.hot) {
    module.hot.accept(logger.error);
    module.hot.dispose(() => {
      logger.log('Restarting server...');
      server.close();
    });
  }
})();
