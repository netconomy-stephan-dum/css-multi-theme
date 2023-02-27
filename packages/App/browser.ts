import engine from "@micro/engine/browser";
import App from './App';
import AssetHandler from "@micro/utils/AssetHandler";

(async () => {
  const assetHandler = AssetHandler();
  // const possibleThemes = ['dark', 'light', 'base'];
  // const theme = possibleThemes[Math.floor(Math.random() * 3)];
  const [theme] = document.location.hostname.split('.');
  // TODO: will be provided by ssr
  // @ts-ignore
  const { default: assetsByChunkName } = await import(/* webpackIgnore: true */ `/assets/${theme}/cssByChunkName.js`);
  // @ts-ignore
  window.assetsByChunkName = assetsByChunkName;
  //@ts-ignore
  window.assetHandler = assetHandler;
  await assetHandler.loadAssets(assetsByChunkName.browser);
  engine({ assetsByChunkName, Component: App, root: '#root' });
})();
