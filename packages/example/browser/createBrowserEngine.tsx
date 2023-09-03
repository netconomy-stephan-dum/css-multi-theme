import React, { FunctionComponent, ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import assetsByTenant from 'multi-tenants/manifestByTenant';
import { AssetsByChunkName } from '@example/app/types';
import { RouteMatch } from '@example/app/getRoute';
import assetHandler from './loadable/AssetHandler';
import ConfigContext from '@example/app/ConfigContext';

export type ImportHandler<T> = () => Promise<{ default: T }> | { default: T };

declare global {
  interface Window {
    tenantName: string;
    assetsByChunkName: AssetsByChunkName;
  }
}

interface BrowserEngineOptions {
  Layout: FunctionComponent<{ children: ReactElement }>;
  selector: string;
  getRoute: (url: string) => RouteMatch | null;
}

const browserEngine = async ({ Layout, selector, getRoute }: BrowserEngineOptions) => {
  const [tenantName] = document.location.hostname.split('.');

  const updateAssetsByTenant = async () => {
    const { default: assetsByChunkName } = await import(
      /* webpackIgnore: true */ assetsByTenant[tenantName]
    );
    // TODO: move to context service
    window.assetsByChunkName = assetsByChunkName;
  };
  if (module.hot) {
    module.hot.accept();
    module.hot.accept('multi-tenants/manifestByTenant', () => {
      return updateAssetsByTenant();
    });
  }

  await updateAssetsByTenant();
  await assetHandler.loadAssets(window.assetsByChunkName.browser);

  const domElement = document.querySelector(selector);
  const match = getRoute(document.location.pathname);

  if (!domElement) {
    throw new Error(`No DOM element '${selector}' found!`);
  }
  if (!match) {
    throw new Error('No matching route found!');
  }
  const { Component } = match;
  const rootElement = createRoot(domElement);
  rootElement.render(
    <ConfigContext.Provider value={{ tenantName }}>
      <Layout>
        <Component />
      </Layout>
    </ConfigContext.Provider>,
  );
};

export default browserEngine;
