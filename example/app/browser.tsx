import createBrowserEngine from '@example/engine-browser';
import routes from '@example/routes';
import Layout from './Layout';

createBrowserEngine({ Layout, selector: '#root', tenantName: window.tenantName, routes });
