import createBrowserEngine from './createBrowserEngine';
import getRoute from '@example/app/getRoute';
import Layout from '@example/app/components/Layout';

createBrowserEngine({
  Layout,
  getRoute,
  selector: '#root',
});
