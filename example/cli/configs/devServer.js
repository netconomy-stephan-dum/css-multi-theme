const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const devServerConfig = {
  devServer: {
    client: false,
    devMiddleware: {
      writeToDisk: true,
    },
    host: `base.localhost`,
    hot: false,
    // port: PORT,
  },
  entry: {},
  mode,
  name: 'dev-server',
  stats: 'minimal',
};

module.exports = devServerConfig;
