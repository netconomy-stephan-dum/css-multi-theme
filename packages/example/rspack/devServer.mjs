import path from 'node:path';

const devServerConfig = ({ PORT= 8080 }) => {
  return {
    devServer: {
      bonjour: false,
      client: {
        overlay: false,
        webSocketURL: {
          hostname: '0.0.0.0',
          pathname: '/ws',
          port: PORT,
          protocol: 'ws',
        },
      },
      devMiddleware: {
        writeToDisk: true,
      },
      historyApiFallback: true,
      host: `base.localhost`,
      hot: true,
      liveReload: false,
      port: PORT,
      static: {
        directory: path.join(process.cwd(), 'dist'),
      },
    },
    entry: {},
    name: 'dev-server',
    stats: 'minimal',
  };
};

export default devServerConfig;
