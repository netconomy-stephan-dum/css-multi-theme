import { TenantOptions, UseOption } from '../types';

// import svgToMiniDataURI from 'mini-svg-data-uri';
import createPostCSSOptions from '../utils/createPostCSSOptions';
const KB = 1024;
const MIN_KB = 5;
const inlineOptions = {
  dataUrlCondition: {
    maxSize: MIN_KB * KB,
  },
};

/*
 * Scss imported by javascript from app logic
 * only keep css module interface
 * emit separate scss file for each tenant
 */
const getTenantEmitter = (options: TenantOptions, use: UseOption) => ({
  issuerLayer: '',
  layer: 'collect-css',
  test: /\.scss$/,
  use: [
    {
      loader: require.resolve('../loaders/css'),
      options,
    },
    ...use,
  ],
});

/*
 * Takes all scss files emitted by collect-css layer
 * enforce that each style only applies possible styles
 * emit all assets from url found within css
 */
const getStylePipeline = (options: TenantOptions, use: UseOption) => ({
  issuerLayer: 'collect-css',
  test: /\.scss$/,
  type: 'asset',
  use: [
    {
      loader: require.resolve('postcss-loader'),
      options: {
        postcssOptions: createPostCSSOptions(options),
      },
    },
    ...use,
  ],
});

/*
 * All assets emit by tenant
 * if the file size is smaller than 5kb the request will return a data uri
 * otherwise a file will be emitted and the according url will be returned instead (similar to asset module)
 */
const getAssetPipelines = () => [
  {
    issuerLayer: 'collect-css',
    test: /\.(tff|woff|woff2|otf|mp4|webm|ogg|mpe?g|avi|flv)$/,
    type: 'asset/resource',
  },
  {
    issuerLayer: 'collect-css',
    parser: inlineOptions,
    test: /\.(jpe?g|gif|png)$/,
    type: 'asset',
  },
  {
    // generator: {
    //   dataUrl: (content: Buffer) => svgToMiniDataURI(content.toString()),
    // },
    issuerLayer: 'collect-css',
    loader: require.resolve('../loaders/inline'),
    parser: inlineOptions,
    test: /\.svg$/,
    type: 'asset',
  },
];
const getCSSRules = (options: TenantOptions, use: UseOption) => [
  getTenantEmitter(options, use),
  getStylePipeline(options, use),
  ...getAssetPipelines(),
];

export default getCSSRules;
