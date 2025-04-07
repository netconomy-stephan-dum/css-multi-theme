const { join } = require('node:path');
const webpack = require('webpack');

const getBaseConfig = async (env, options) => {
  const { mode = 'production', target } = options;
  const isDevelopment = mode === 'development';
  const packageJson = (
    await import('file://' + join(process.cwd(), './package.json'), { with: { type: 'json' } })
  ).default;

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
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          loader: require.resolve('swc-loader'),
          options: {
            swcrc: false,
            jsc: {
              experimental: {
                plugins: [
                  [
                    require.resolve('@swc/plugin-loadable-components'),
                    {
                      signatures: [
                        {
                          from: 'multi-tenants/loadable',
                          name: 'default',
                        },
                      ],
                    },
                  ],
                ],
              },
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  development: isDevelopment,
                  refresh: isDevelopment && target !== 'node',
                  runtime: 'automatic',
                },
              },
            },
          },
          test: /\.[jt]sx?$/,
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        ROOT_MODULE_PATH: JSON.stringify(join(process.cwd(), packageJson.main)),
      }),
    ],
    // plugins: [isDevelopment && new ReactRefreshWebpackPlugin()].filter(Boolean),
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
