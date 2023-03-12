import loadable from "@example/engine-browser/loadable";
import { Route } from "@example/engine-browser/createBrowserEngine";

const routes: Route[] = [
  {
    Component: loadable(() => import(/* webpackChunkName:"Home" */ './Home'), 'Home'),
    reg: /\//,
  },
  {
    Component: loadable(() => import(/* webpackChunkName:"Imprint" */ './Imprint'), 'Imprint'),
    reg: /imprint/,
  }
]

export default routes;
