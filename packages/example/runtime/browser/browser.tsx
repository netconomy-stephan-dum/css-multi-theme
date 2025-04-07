import React, { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { loadableReady } from '@loadable/component';
import { createRoot, hydrateRoot } from 'react-dom/client';
import ConfigContext from '@example/app/ConfigContext';
import prepareAssetsByChunkName from 'multi-tenants/prepareAssetsByChunkName';

const createBrowserRuntime = async (selector: string) => {
  const [tenantName] = document.location.hostname.split('.');

  const App = (
    await import(
      /* webpackMode: "eager" */
      ROOT_MODULE_PATH
    )
  ).default;

  const configContext = await prepareAssetsByChunkName(
    tenantName,
    Number.parseInt(document.location.port, 10),
  );

  const vDOM = (
    <StrictMode>
      <BrowserRouter>
        <ConfigContext.Provider value={configContext}>
          <App />
        </ConfigContext.Provider>
      </BrowserRouter>
    </StrictMode>
  );

  const domElement = document.querySelector(selector);

  if (!domElement) {
    console.error(`No root element found for '${selector}`);
  } else {
    const isSSR = document.getElementById('__LOADABLE_REQUIRED_CHUNKS__');

    if (isSSR) {
      await loadableReady();
      hydrateRoot(domElement, vDOM);
    } else {
      const rootElement = createRoot(domElement);
      rootElement.render(vDOM);
    }
  }
};

(async () => {
  await createBrowserRuntime('#root');
})();
