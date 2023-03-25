import {TenantOptions, UseOption} from '../types';

import svgToMiniDataURI from 'mini-svg-data-uri';
import createPostCSSOptions from '../utils/createPostCSSOptions';

const inlineOptions = {
  dataUrlCondition: {
    maxSize: 4 * 1024 // 4kb
  }
},
 getCSSRules = (options: TenantOptions, use: UseOption) => [
  /*
   * Scss imported by javascript from app logic
   * only keep css module interface
   * emit separate scss file for each tenant
   */
  {
    test: /scss$/,
    layer: 'collect-css',
    issuerLayer: '',
    use: [
      {
        loader: require.resolve('../loaders/css'),
        options,
      },
      ...use
    ],
  },
  /*
   * Takes all scss files emitted by collect-css layer
   * enforce that each style only applies possible styles
   * emit all assets from url found within css
   */
  {
    test: /scss$/,
    issuerLayer: 'collect-css',
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
  },
  /*
   * All assets emit by tenant
   * if the file size is smaller than 5kb the request will return a data uri
   * otherwise a file will be emitted and the according url will be returned instead (similar to asset module)
   */
  {
    issuerLayer: 'collect-css',
    test: /\.(tff|woff|woff2|otf)$/,
    type: "asset/resource",
  },
  {
    issuerLayer: 'collect-css',
    test: /\.(jpe?g|gif|png)$/,
    type: "asset",
    parser: inlineOptions,
    // Loader: require.resolve('../loaders/inline'),
  },
  {
    issuerLayer: 'collect-css',
    test: /\.svg$/,
    type: 'asset',
    parser: inlineOptions,
    generator: {
      dataUrl: (content: Buffer) => svgToMiniDataURI(content.toString())
    }
  }
]

export default getCSSRules;
