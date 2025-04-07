import { join } from 'node:path';
import { DefinePlugin } from '@rspack/core';

const getCommonConfig = async (env, { target }) => {
  const isProduction = env.RSPACK_BUILD;
  const packageJson = (await import('file://'+join(process.cwd(), './package.json'), { with: {type: 'json'}})).default;

  const config = {
    experiments: {
      layers: true,
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.[jt]sx?$/,
          loader: 'builtin:swc-loader',
          options: {
            swcrc: false,
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  development: !isProduction,
                  refresh: !isProduction && target !== 'node',
                },
              },
              experimental: {
                plugins: [['@swc/plugin-loadable-components',
                  {
                    signatures: [
                      {
                        from: 'multi-tenants/loadable',
                        name: 'default',
                      },
                    ]
                  }
                ]],
              },
            },
          },
        },
      ],
    },
    plugins: [
      new DefinePlugin({
        ROOT_MODULE_PATH: JSON.stringify(join(process.cwd(), packageJson.main)),
      })
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '...'],
    },
    stats: 'minimal',
    target,
  };

  if (isProduction) {
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

export default getCommonConfig;
