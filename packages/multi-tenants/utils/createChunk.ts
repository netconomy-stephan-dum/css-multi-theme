import { Compilation } from 'webpack';
import { RawSource } from 'webpack-sources';
import { ChunkHandler } from '../types';
import { createHash } from 'node:crypto';

type CreateSource = (assets: Compilation['assets'], files: string[]) => string;
const createChunk = (
  { compilation, auxiliaryFiles, tenantName, id }: ChunkHandler,
  assets: string[],
  ext: string,
  createSource: CreateSource,
  hash?: string,
) => {
  const fileRegEx = new RegExp(`\\.${ext}(?:\\?.*)?$`, 'u');
  const files = Array.from(auxiliaryFiles).filter(
    (assetFile) => assetFile.startsWith(`assets/${tenantName}`) && fileRegEx.test(assetFile),
  );

  if (!files.length) {
    return [];
  }

  const rawSource = createSource(compilation.assets, files);
  const contentHash = hash || createHash('sha256').update(rawSource).digest('hex').slice(0, 8);
  const filePath = `/assets/${tenantName}/${ext}/${id}_${contentHash}.${ext}`;

  assets.push(filePath);
  // TODO: type mismatch in both upstream repos and webpack doesnt export Source
  (compilation.assets[filePath] as RawSource) = new RawSource(rawSource);

  files.forEach((file) => {
    compilation.deleteAsset(file);
  });

  return filePath;
};

export default createChunk;
