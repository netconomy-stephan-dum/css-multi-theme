const path = require("node:path");

const isInternalRequestReg = /^\.?\//;

const resolveRelative = (context, { appDir }) => {
  const { resourcePath, _module: { rawRequest } } = context;

  // requested internal file
  if (isInternalRequestReg.test(rawRequest)) {
    const overloadPath = path
      .relative(appDir, resourcePath)
      .replace(/\\/g, '/');

    return {
      src: overloadPath,
      dest: overloadPath,
    };
  }

  // requested file from package.json
  return {
    // add modules directory to avoid naming conclusions
    src: `modules/${rawRequest}`,
    dest: rawRequest,
  }
}

const overload = (context, options, each = () => {}, search = () => '') => {
  const { appDir, tenants } = options;
  const { src, dest } = resolveRelative(context, options);
  // const filePath = path
  //   .relative(appDir, context.resourcePath)
  //   .replace(/\\/g, '/');
  //
  // debugger;
  // // TODO: use nearest package.json instead
  // // const filePath = context.utils.contextify(appDir, context.resourcePath);
  //
  // const requestFile = filePath.replace(/^\.\./, 'modules')
  // const targetFile = filePath.replace(/^\.\.\//, '');

  return Promise.all(
    tenants.map(({ tenantDirs, tenantName }) => context.getResolve({ modules: tenantDirs })(appDir, src)
      .catch(() => context.resourcePath)
      .then((overloadPath) => new Promise((resolve, reject) => {
        context.loadModule(overloadPath + search(tenantName), (error, source) => {
          if (error) {
            return reject(error);
          }

          return resolve(each(tenantName, dest, source.toString()));
        });
      }))
  ))
}

module.exports = overload;
