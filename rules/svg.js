const getSVGRules = (options, use) => [
  {
    issuerLayer: 'svg-collect',
    test: /svg$/,
    type: "asset",
    use
  },
  {
    issuer: /\.[jt]sx?$/,
    layer: 'svg-collect',
    issuerLayer: '',
    test: /svg$/,
    use: [
      {
        loader: require.resolve('../loaders/svg'),
        options,
      },
    ],
  },
]

module.exports = getSVGRules;