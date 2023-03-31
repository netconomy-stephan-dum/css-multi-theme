import createBrowserEngine from '@example/engine-server';
import routes from '@example/routes';
import Layout from '../components/Layout/Layout';

createBrowserEngine({
  Layout,
  parseEnvFromURL: (url) => ({ url }),
  routes,
});
