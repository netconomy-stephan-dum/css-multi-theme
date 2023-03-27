import { Chunk, Compilation } from 'webpack';
import { RawSource } from 'webpack-sources';

type CreateSource = (assets: Compilation['assets'], files: string[]) => string;
const createChunk = (
  compilation: Compilation,
  chunkAssets: Chunk['auxiliaryFiles'],
  tenantName: string,
  id: string,
  assets: string[],
  ext: string,
  createSource: CreateSource,
  targetExt = ext,
) => {
  const fileRegEx = new RegExp(`\\.${ext}(?:\\?.*)?$`, 'u');
  const files = Array.from(chunkAssets).filter(
    (assetFile) => (!tenantName || assetFile.startsWith(tenantName)) && fileRegEx.test(assetFile),
  );

  if (!files.length) {
    return null;
  }

  const rawSource = createSource(compilation.assets, files);
  const filePath = `assets/${tenantName ? `${tenantName}/` : ''}${targetExt}/${id}.${targetExt}`;

  assets.push(filePath);
  // TODO: type mismatch in both upstream repos and webpack doesnt export Source
  (compilation.assets[filePath] as RawSource) = new RawSource(rawSource);

  files.forEach((file) => {
    compilation.deleteAsset(file);
  });

  return null;
};

export default createChunk;
