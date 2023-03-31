// TODO: check why webpack.Compiler version are off and use the @types package instead
declare module 'webpack-hot-middleware' {
  import { Compiler } from 'webpack';
  import { NextHandleFunction } from 'connect';
  interface EventStream {
    publish(payload: any): void;
    close(): void;
  }

  const WebpackHotMiddleware: (compiler: Compiler) => NextHandleFunction & EventStream;
  export default WebpackHotMiddleware;
}
