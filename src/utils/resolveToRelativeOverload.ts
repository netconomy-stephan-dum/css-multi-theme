// import { access, readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { LoaderContext } from 'webpack';
import { TenantOptions } from '../types';

import path from 'node:path';

// const exists = (filePath: string) =>
//   access(filePath).then(
//     () => true,
//     () => false,
//   );
const upwardReg = /^((?:\.\.\/)*)(.*)/;
const findPkgRecursive = (base: string, segments: string[], index = -1): string => {
  const filePath = `${base}/${segments.slice(0, index).join('/')}/package.json`;

  if (existsSync(filePath)) {
    return path.dirname(filePath);
  }
  return findPkgRecursive(base, segments, index - 1);
};
const findPkgDir = (relative: string, appDir: string) => {
  const [, upwardSegments, restPath] = relative.match(upwardReg) || [];
  const base = path.join(appDir, upwardSegments);
  const segments = restPath.split('/');
  return findPkgRecursive(base, segments);
};

// const isInternalRequestReg = /^\.?\//;
const resolveToRelativeOverload = (
  context: LoaderContext<TenantOptions>,
  { appDir }: TenantOptions,
) => {
  const { resourcePath } = context;
  // const { rawRequest } = mod as NormalModule;

  const overloadPath = path.relative(appDir, resourcePath).replace(/\\\\?/g, '/');

  if (overloadPath.startsWith('..')) {
    // Requested file from package.json
    // TODO: use async
    const packageDir = findPkgDir(overloadPath, appDir);
    // TODO: use async
    const pkgJSON = JSON.parse(readFileSync(`${packageDir}/package.json`, { encoding: 'utf-8' }));
    const filePath = path
      .join(pkgJSON.name, path.relative(packageDir, resourcePath))
      .replace(/\\\\?/g, '/');

    return {
      dest: filePath,
      // Add modules directory to avoid naming conclusions
      src: `modules/${filePath}`,
    };
  }

  // Requested internal file
  return {
    dest: overloadPath,
    src: overloadPath,
  };
};

export default resolveToRelativeOverload;
