const { URLSearchParams } = require("node:url");
const localByDefault = require("postcss-modules-local-by-default");
const modulesScope = require("postcss-modules-scope");
const getLocalIdent = (context, localName) => {
  const search = new URLSearchParams(context.resourceQuery);
  const rawClassNames = search.get('classNames');
  // TODO: check if we can resolve it without parsing it twice
  const classNames = JSON.parse(JSON.parse(decodeURIComponent(rawClassNames)));
  const className = classNames[localName];

  if (className) {
    return className;
  }

  throw new Error(`Classname '${localName}' did not match any selector. Possible Selectors:\n\t${Object.keys(classNames).join('\n\t')}`)
};
const removeExport = (opts = {}) => {
  return {
    postcssPlugin: 'remove-export',
    Once (root, { result }) {
      debugger;
      root.walkRules(':export', function (rule) {
        rule.remove();
      })
    }
  }
};
removeExport.postcss = true

const getCSSRules = (options, use) => [
  {
    test: /scss$/,
    issuerLayer: 'collect-css',
    type: 'asset',
    use: (context) => [
      {
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            plugins: [
              localByDefault(),
              modulesScope({
                exportGlobals: false,
                generateExportEntry: false,
                generateScopedName(exportName) {
                  return getLocalIdent(context, exportName);
                },
              }),
              removeExport(),
            ],
          },
        },
      },
      ...use,
    ],
  },
  {
    test: /scss$/,
    layer: 'collect-css',
    issuerLayer: '',
    use: [
      {
        loader: require.resolve('../loaders/css'),
        options,
      },
      // TODO: replace with post-css
      {
        loader: require.resolve('css-loader'),
        options: {
          modules: {
            exportOnlyLocals: true,
          }
        },
      },
      // TODO: replace with post-css
      require.resolve('sass-loader'),
    ],
  },
]

module.exports = getCSSRules;