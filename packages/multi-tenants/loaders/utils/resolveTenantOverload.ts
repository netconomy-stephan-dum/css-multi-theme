import { access } from 'node:fs/promises';
import path from 'node:path';

const fileExists = (filePath: string) =>
  access(filePath).then(
    () => true,
    () => false,
  );

const resolveTenantOverload = (originalPath: string, tenant: string) => {
  const fileExtension = path.extname(originalPath);
  const fileName = path.basename(originalPath, fileExtension);
  const dirname = path.dirname(originalPath);
  const overloadPath = `${dirname}/${fileName}.${tenant}${fileExtension}`;
  return fileExists(overloadPath).then((exists) => (exists ? overloadPath : originalPath));
};

export default resolveTenantOverload;
