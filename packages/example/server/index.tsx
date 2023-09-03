import express from 'express';
import compression from 'compression';
import assetsByTenant from 'multi-tenants/manifestByTenant';
import HTMLIndex from './HTMLIndex';
import Layout from '@example/app/components/Layout';
import getRoute from '@example/app/getRoute';
import reactDOM from 'react-dom/server';
import React from 'react';
import { ChunkExtractor } from '@loadable/server';

const PORT = 8113;
const logger = console;

const createServer = () => {
  const app = express();

  app.use(compression());
  app.use(async (request, response) => {
    const [rawTenantName] = request.hostname.split('.');
    const tenantName = rawTenantName === 'localhost' ? 'base' : rawTenantName;

    const assetsByChunkName = (
      await import(
        /* webpackIgnore: true */ `file://${process.cwd()}/dist${assetsByTenant[tenantName]}`
      )
    ).default;

    const match = getRoute(request.url);
    if (!match) {
      throw new Error('No matching route found!');
    }
    const extractor = new ChunkExtractor({
      entrypoints: ['browser'],
      statsFile: `${process.cwd()}/dist/assets/${tenantName}/loadable-stats.json`,
    });
    const html = reactDOM.renderToString(<HTMLIndex lang="de" title="someTitle" />);
    const { Component } = match;
    const layout = reactDOM.renderToString(
      extractor.collectChunks(
        <Layout>
          <Component />
        </Layout>,
      ),
    );

    const head = [
      `<script>window.assetsByChunkName = ${JSON.stringify(assetsByChunkName)}</script>`,
      extractor.getLinkTags(),
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
