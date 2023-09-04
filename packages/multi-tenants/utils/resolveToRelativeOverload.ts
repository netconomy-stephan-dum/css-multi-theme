import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { LoaderContext } from 'webpack';
import { TenantOptions } from '../types';

const exists = (filePath: string) =>
  access(filePath).then(
    () => true,
    () => false,
  );
const upwardReg = /^((?:\.\.\/)*)(.*)/;
const findPkgRecursive = async (base: string, segments: string[], index = -1): Promise<string> => {
  const filePath = `${base}/${segments.slice(0, index).join('/')}/package.json`;

  if (await exists(filePath)) {
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

const resolveToRelativeOverload = async (
  context: LoaderContext<TenantOptions>,
  { appDir }: TenantOptions,
) => {
  const { resourcePath } = context;
  const overloadPath = path.relative(appDir, resourcePath).replace(/\\\\?/g, '/');

  if (overloadPath.startsWith('..')) {
    // Requested file from package.json
    const packageDir = await findPkgDir(overloadPath, appDir);
    // TODO: use async
    const pkgJSON = JSON.parse(await readFile(`${packageDir}/package.json`, { encoding: 'utf-8' }));
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
