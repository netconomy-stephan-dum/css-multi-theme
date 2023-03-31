// import { IncomingMessage, ServerResponse } from 'http';
import express, { Application } from 'express';
import { Compiler } from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

const applyDevMiddleware = (app: Application, compilers: Record<string, Compiler>) => {
  // app.use((req: IncomingMessage, res: ServerResponse<IncomingMessage>, next: NextFunction) => {
  //   res.setHeader('Access-Control-Allow-Origin', '*');
  //   return next();
  // });
  const devMiddleware = webpackDevMiddleware(compilers.client);
  const hotMiddleware = webpackHotMiddleware(compilers.client);

  // Allow hot reloading for CSR
  app.all(/.*__webpack_hmr.*/, hotMiddleware);
  app.get(/.*\/updates\/.*hot-update\.jso?n?.*/, [hotMiddleware, devMiddleware]);
  // Transfer JS/CSS that have been compiled by webpack
  app.all(/\/dist\/.*/, devMiddleware);
  // And remaining assets are just served statically
  app.use('/assets', express.static(`./dist/assets`, { fallthrough: false }));
};

export default applyDevMiddleware;
