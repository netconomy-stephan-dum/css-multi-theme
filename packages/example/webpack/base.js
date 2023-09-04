const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const getBaseConfig = (env, options) => {
  const { mode = 'production' } = options;
  const isDevelopment = mode === 'development';

  Object.assign(process.env, env);

  const config = {
    cache: false,
    entry: {},
    experiments: {
      layers: true,
    },
    mode,
    module: {
      rules: [
        {
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            envName: mode,
            plugins: ['@loadable/babel-plugin', isDevelopment && 'react-refresh/babel'].filter(
              Boolean,
            ),
          },
          test: /\.[tj]sx?$/,
        },
      ],
    },
    plugins: [isDevelopment && new ReactRefreshWebpackPlugin()].filter(Boolean),
    resolve: {
      extensions: ['.ts', '.tsx', '...'],
    },
    stats: 'minimal',
  };

  if (mode === 'production') {
    Object.assign(config, {
      optimization: {
        splitChunks: {
          chunks: 'all',
        },
      },
    });
  }

  return config;
};

module.exports = getBaseConfig;
