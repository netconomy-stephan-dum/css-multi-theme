import React from 'react';
import loadable from 'multi-tenant-plugin/loadable';
import { Route, Switch } from 'react-router';

const Home = loadable(() => import(/* webpackChunkName: "Home" */ './pages/Home'));
const Imprint = loadable(() => import(/* webpackChunkName: "Imprint" */ './pages/Imprint'));

const Routes = () => (
  <Switch>
    <Route path="/imprint" component={Imprint} />
    <Route path="/" component={Home} />
  </Switch>
);

export default Routes;
