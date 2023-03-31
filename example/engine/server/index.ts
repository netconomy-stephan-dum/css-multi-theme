import createApp from './createApp';
// import { Route } from '@example/engine-core/types';
// import { FunctionComponent, ReactElement } from 'react';

const upsert = () => createApp(process.env).listen();

let app = upsert();

if (module.hot) {
  module.hot.accept('./createApp', () => {
    console.log('accept ./createApp');
    app.close();
    app = upsert();
  });
  module.hot.dispose((data) => {
    console.log('dispose ./createApp');
    app.close();
  });
}

// interface CreateServerEngineOptions {
//   Layout: FunctionComponent<{ children: ReactElement }>;
//   routes: Route[];
//   parseEnvFromURL: (requestURL: string) => Record<string, unknown>;
// }
//
// const createServerEngine = ({ Layout, parseEnvFromURL, routes }: CreateServerEngineOptions) => {
//   // const serverCompiler = webpack(serverConfig);
//   // const handlers: CompletionHandler[] = [];
//   //
//   // const firstComplete = createDerefer();
//   // const compilerDerefer = createDerefer();
//   // const context = {
//   //   promise: compilerDerefer,
//   // };
//   // const onceComplete: CompletionHandler = (error, stats) => {
//   //   handlers.splice(handlers.indexOf(onceComplete), 1);
//   //   if (error) {
//   //     return firstComplete.reject(error);
//   //   }
//   //   return firstComplete.resolve(stats);
//   // };
//   // handlers.push(onceComplete);
//   // serverCompiler.watch({}, (error, stats) => {
//   //   handlers.forEach((handler) => {
//   //     handler(error, stats);
//   //   });
//   // });
//   //
//   //
//   // const middleware = (next) => {
//   //   compilerDerefer.then(() => {
//   //     next();
//   //   })
//   // }
// };
//
// export default createServerEngine;
