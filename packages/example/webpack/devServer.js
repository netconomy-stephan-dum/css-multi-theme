const path = require('node:path');
const devServerConfig = ({ PORT }) => {
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
    output: {
      // clean: true,
    },
    stats: 'minimal',
  };
};

module.exports = devServerConfig;
