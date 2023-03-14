const createPostCSSOptions = require('../utils/createPostCSSOptions');
const getCSSRules = (options, use) => [
  // scss imported by javascript from app logic
  // only keep css module interface
  // emit separate scss file for each tenant
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
  // takes all scss files emitted by collect-css layer
  // enforce that each style only applies possible styles
  // emit all assets from url found within css
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
  // all assets emit by tenant
  // if the file size is smaller than 5kb the request will return a data uri
  // otherwise a file will be emitted and the according url will be returned instead (similar to asset module)
  {
    issuerLayer: 'collect-css',
    test: /(svg|tff|woff|woff2|otf|jpe?g|gif|png)$/,
    type: "asset",
    loader: require.resolve('../loaders/inline'),
  },
]

module.exports = getCSSRules;