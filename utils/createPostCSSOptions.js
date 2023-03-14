const path = require('node:path');
const { URLSearchParams } = require("node:url");
const localByDefault = require("postcss-modules-local-by-default");
const modulesScope = require("postcss-modules-scope");
const postcssURL = require('postcss-url');

const postcssExport = require('./postcssExport');
const loadModule = require('./promisedLoadModule');

const createPostCSSOptions = (options) => (context) => {
  const search = new URLSearchParams(context.resourceQuery);
  const tenantName = search.get('tenant');
  const classNames = JSON.parse(decodeURIComponent(search.get('classNames')));

  const { tenantDirs } = options.tenants.find((tenant) => tenant.tenantName === tenantName);

  const relativeReducePath = path
    .relative(options.appDir, path.dirname(context.resourcePath))
    .replace('..', 'modules')
    .replace(/\\\\?/g, '/');

  const resolve = context.getResolve({ modules: tenantDirs });

  return ({
    plugins: [
      localByDefault(),
      modulesScope({
        generateScopedName(localName) {
          const className = classNames[localName];

          if (className) {
            return className;
          }

          throw new Error(`Classname '${localName}' did not match any selector. Possible Selectors:\n\t${Object.keys(classNames).join('\n\t')}`)
        },
      }),
      postcssExport(),
      postcssURL({
        url: (asset) =>
          resolve(options.appDir, relativeReducePath+'/'+asset.url)
            .catch((error) => path.join(path.dirname(context.resourcePath), asset.url))
            .then((overloadPath) => loadModule(context, overloadPath+`?tenant=${tenantName}`))
      }),
    ],
  })
}

module.exports = createPostCSSOptions;
