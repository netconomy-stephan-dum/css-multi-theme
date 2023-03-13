const path = require('node:path');
const { URLSearchParams } = require("node:url");
const {access} = require('node:fs/promises');
const localByDefault = require("postcss-modules-local-by-default");
const modulesScope = require("postcss-modules-scope");
const postcssURL = require('postcss-url');

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
      root.walkRules(':export', function (rule) {
        rule.remove();
      })
    }
  }
};
removeExport.postcss = true

const replaceURL = (options, context) => {
  const { tenantDirs, appDir } = options;
  return {
    postcssPlugin: 'replaceURL',
    Once(root) {

    },
  }
}

replaceURL.postcss = true;
function encode(code) {
  return code
    .replace(/%/g, "%25")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/&/g, "%26")
    .replace(/#/g, "%23")
    .replace(/{/g, "%7B")
    .replace(/}/g, "%7D");
}

function addXmlns(code) {
  if (code.indexOf("xmlns") === -1) {
    return code.replace(/<svg/g, '<svg xmlns="http://www.w3.org/2000/svg"');
  } else {
    return code;
  }
}

function normalize(code) {
  return code
    .replace(/'/g, "%22")
    .replace(/"/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function transform(code) {
  return `"data:image/svg+xml;charset=utf-8,${addXmlns(normalize(encode(code)))}"`;
}
const exists = (filePath) => access(filePath).then(() => true, () => false);
const getOverload = async (lookupDirs, subPath) => {
  for (let i = 0; i < lookupDirs.length; i++) {
    const searchPath = path.join(lookupDirs[i], subPath);
    if (await exists(searchPath)) {
      return searchPath;
    }
  }
}

let counter = 0;
const getCSSRules = (options, use) => [
  {
    issuerLayer: 'collect-css',
    test: /svg$/,
    type: "asset",
  },
  {
    test: /scss$/,
    issuerLayer: 'collect-css',
    type: 'asset',
    use: (context) => {
      const tenantName = new URLSearchParams(context.resourceQuery).get('tenant');
      const relativeReducePath = path
        .relative(options.appDir, path.dirname(context.resource))
        .replace('..', '@micro')
        .replace(/\\\\?/g, '/');

      const { tenantDirs } = options.tenants.find((tenant) => tenant.tenantName === tenantName);
      const lookupDirs = tenantDirs.map((tenantDir) => {
        return path.join(tenantDir, relativeReducePath)
      });
      lookupDirs.push(path.dirname(context.resource));
      const to = path.join(options.appDir,`/dist/assets/${tenantName}`);

      return [
        {
          loader: require.resolve('postcss-loader'),
          options: {
            postcssOptions: (ctx) => ({
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
                postcssURL({
                  url: async (asset) => {
                    const overloadPath = await getOverload(lookupDirs, asset.url);
                    return new Promise((resolve, reject) => {

                      ctx.loadModule(overloadPath, (error, rawSource) => {
                        if (error) {
                          return reject(error);
                        }
                        const source = rawSource.toString();

                        if (source.length > 1024 * 5) {
                          const publicPath = '/assets/'+tenantName+'/css/'+ relativeReducePath+'/'+path.basename(asset.url);
                          ctx.emitFile(publicPath, source);
                          return resolve(publicPath);
                        } else {
                          // TODO: based on ext
                          // return resolve(`data:image/svg+xml;utf8,${source.replace(/"/g, "'")}`);
                          return resolve(transform(source))
                          // const encoding = 'base64';
                          // return resolve(`data:image/${path.extname(asset.absolutePath).slice(1)};${encoding},${Buffer.from(source).toString(encoding)}`);
                        }
                      })
                    });
                  },
                }),
              ],
            }),
          },
        },
        ...use,
      ];
    },
  },
  {
    test: /scss$/,
    layer: 'collect-css',
    issuerLayer: '',
    use: (context) => {
      console.log(context.issuer, context.resource);
      return [
        {
          loader: require.resolve('../loaders/css'),
          options: {
            count: counter++,
            ...options,
          },
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
      ]
    },
  },
]

module.exports = getCSSRules;