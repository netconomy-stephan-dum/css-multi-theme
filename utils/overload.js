const path = require("node:path");

const overload = (context, options, each = () => {}, search = () => '') => {
  const { appDir, tenants } = options;
  const filePath = path
    .relative(appDir, context.resourcePath)
    .replace(/\\/g, '/');

  const requestFile = filePath.replace(/^\.\./, 'modules')
  const targetFile = filePath.replace(/^\.\.\//, '');

  return Promise.all(
    tenants.map(({ tenantDirs, tenantName }) => context.getResolve({ modules: tenantDirs })(appDir, requestFile)
      .catch(() => context.resourcePath)
      .then((overloadPath) => new Promise((resolve, reject) => {
        context.loadModule(overloadPath + search(tenantName), (error, source) => {
          if (error) {
            return reject(error);
          }

          return resolve(each(tenantName, targetFile, source.toString()));
        });
      }))
  ))
}

module.exports = overload;
