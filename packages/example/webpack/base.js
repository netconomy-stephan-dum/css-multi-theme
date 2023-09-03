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
            plugins: [
              '@loadable/babel-plugin',
              'react-refresh/babel',
            ],
          },
          test: /\.[tj]sx?$/,
        },
        // {
        //   loader: require.resolve('swc-loader'),
        //   options: {
        //     jsc: {
        //       transform: {
        //         react: {
        //           development: isDevelopment,
        //           refresh: isDevelopment,
        //         },
        //       },
        //     },
        //   },
        //   test: /[jt]sx?$/,
        // },

        // {
        //   exclude: /node_modules/,
        //   test: /\.[jt]sx?$/,
        //   use: [
        //     {
        //       loader: require.resolve('ts-loader'),
        //       options: {
        //         getCustomTransformers: () => ({
        //           before: [isDevelopment && reactRefreshTypeScript()].filter(Boolean),
        //         }),
        //         transpileOnly: isDevelopment,
        //       },
        //     },
        //   ],
        // },
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
  } else {
    // Object.assign(config, {
    //   optimization: {
    //     sideEffects: true,
    //     runtimeChunk: 'single',
    //   },
    // });
  }

  return config;
};

module.exports = getBaseConfig;
