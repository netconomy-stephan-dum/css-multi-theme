const getSVGRules = (options, use) => [
  // svg imported by javascript from app logic
  // emit separate svg file for each tenant
  // insert symbol #id and viewport
  // sprite_name handled in plugin
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
  // parse all svg symbols for each tenant
  // output is concatenated to chunk sprite
  {
    issuerLayer: 'svg-collect',
    test: /svg$/,
    type: "asset",
    use
  },
]

module.exports = getSVGRules;