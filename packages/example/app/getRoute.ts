import loadable from '@example/engine-browser/loadable';
import { Route } from './types';
import { FunctionComponent } from 'react';

const routes: Route[] = [
  {
    Component: loadable(
      () => import(
        /* webpackChunkName: "Home"*/
        /* webpackPrefetch: true */
        './pages/Home'
      ),
      'Home',
    ),
    reg: /\//,
  },
  {
    Component: loadable(
      () => import(/* webpackChunkName: "Imprint" */ './pages/Imprint'),
      'Imprint',
    ),
    reg: /imprint/,
  },
];
export interface RouteMatch {
  Component: FunctionComponent;
  params: string[];
}
const getRoute = (path: string) => {
  for (let index = 0; index < routes.length; index += 1) {
    const match = routes[index].reg.exec(path);
    if (match) {
      return {
        Component: routes[index].Component,
        params: match.slice(1),
      };
    }
  }
  return null;
};

export default getRoute;
