import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import assetsByTenant from 'multi-tenants/manifestByTenant';
import { AssetsByChunkName } from '@example/app/types';

import assetHandler from './loadable/AssetHandler';
import ConfigContext from '@example/app/ConfigContext';

import Routes from '@example/app/Routes';
import Layout from '@example/app/components/Layout';

import { BrowserRouter } from 'react-router-dom';
import { loadableReady } from '@loadable/component';

const browserEngine = async (selector: string) => {
  const [tenantName] = document.location.hostname.split('.');
  let assetsByChunkName: AssetsByChunkName = {};
  const updateAssetsByTenant = async () => {
    assetsByChunkName = (await import(/* webpackIgnore: true */ assetsByTenant[tenantName]))
      .default;
  };
  if (module.hot) {
    module.hot.accept();
    module.hot.accept('multi-tenants/manifestByTenant', () => {
      return updateAssetsByTenant();
    });
  }

  await updateAssetsByTenant();
  const isSSR = document.getElementById('__LOADABLE_REQUIRED_CHUNKS__');

  const domElement = document.querySelector(selector);

  if (!domElement) {
    throw new Error(`No DOM element '${selector}' found!`);
  }
  const configContext = {
    assetsByChunkName,
    port: Number.parseInt(document.location.port, 10),
    tenantName,
  };
  const vDOM = (
    <React.StrictMode>
      <BrowserRouter>
        <ConfigContext.Provider value={configContext}>
          <Layout>
            <Routes />
          </Layout>
        </ConfigContext.Provider>
      </BrowserRouter>
    </React.StrictMode>
  );

  if (isSSR) {
    loadableReady();
    hydrateRoot(domElement, vDOM);
  } else {
    await assetHandler.loadAssets(assetsByChunkName.main);
    const rootElement = createRoot(domElement);
    rootElement.render(vDOM);
  }
};

browserEngine('#root');

export default browserEngine;
