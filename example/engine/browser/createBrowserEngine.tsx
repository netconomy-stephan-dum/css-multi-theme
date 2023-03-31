import React, { FunctionComponent, ReactElement, Suspense } from 'react';
import { createRoot } from "react-dom/client";
import AssetHandler from "./loadable/AssetHandler";
import assetsByTenant from '@multi-tenants/webpack-plugin/manifestByTenant';
import { AssetsByChunkName, Route } from '@example/engine-core/types';
export type ImportHandler<T> = () => Promise<{ default: T }>;

declare global {
  interface Window {
    tenantName: string;
    assetHandler: ReturnType<typeof AssetHandler>;
    assetsByChunkName: AssetsByChunkName;
  }
}

const getRoute = (path: string, routes: Route[]) => {
  for (let i = 0; i < routes.length; i++) {
    const match = routes[i].reg.exec(path);
    if (match) {
      return {
        Component: routes[i].Component,
        params: match.slice(1),
      };
    }
  }
  return null;
};

interface BrowserEngineOptions {
  Layout: FunctionComponent<{ children: ReactElement }>;
  selector: string;
  tenantName: string;
  routes: Route[];
}

const updateAssetsByTenant = async () => {
  const { default: assetsByChunkName } = await import(/* webpackIgnore: true */ assetsByTenant[browserEngine.tenantName]);
  // TODO: move to context service
  window.assetsByChunkName = assetsByChunkName;
};

if (module.hot) {
  module.hot.accept('@multi-tenants/webpack-plugin/manifestByTenant', () => {
    return updateAssetsByTenant();
  });
}
const browserEngine = async ({ Layout, selector, tenantName, routes }: BrowserEngineOptions) => {
  // TODO: move to context service
  const assetHandler = AssetHandler();
  window.assetHandler = assetHandler;
  browserEngine.tenantName = tenantName;

  await updateAssetsByTenant();
  await assetHandler.loadAssets(window.assetsByChunkName.browser);

  const domElement = document.querySelector(selector);
  const match = getRoute(document.location.pathname, routes);

  if (!domElement) {
    throw new Error(`No DOM element '${selector}' found!`)
  }
  if (!match) {
    throw new Error('No matching route found!');
  }
  const { Component } = match;
  const rootElement = createRoot(domElement);
  rootElement.render(<Layout><Suspense><Component /></Suspense></Layout>);
};

browserEngine.tenantName = '';

export default browserEngine;