import React, {FunctionComponent, ReactElement} from "react";
import { createRoot } from "react-dom/client";
import AssetHandler from "./loadable/AssetHandler";

export type AssetsByChunkName = Record<string, string[]>;
export type ImportHandler<T> = () => Promise<{ default: T }>;

declare global {
  interface Window {
    tenantName: string;
    assetHandler: ReturnType<typeof AssetHandler>;
    assetsByChunkName: AssetsByChunkName;
  }
}
export interface Route {
  Component: FunctionComponent;
  reg: RegExp;
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
const browserEngine = async ({ Layout, selector, tenantName, routes }: BrowserEngineOptions) => {

  // TODO: move to context service
  const assetHandler = AssetHandler();
  window.assetHandler = assetHandler;
  // window.tenantName = tenantName;
  // TODO: will be provided by ssr
  const { default: assetsByChunkName } = await import(/* webpackIgnore: true */ `/assets/${tenantName}/assetsByChunkName.js`);

  window.assetsByChunkName = assetsByChunkName;
  await assetHandler.loadAssets(assetsByChunkName.browser);

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
  rootElement.render(<Layout><Component /></Layout>);
};

export default browserEngine;
