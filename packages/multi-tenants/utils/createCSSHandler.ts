import { ChunkHandler } from '../types';
import sortPaths from './sortPaths';
import createChunk from './createChunk';
import createCSSChunk from './createCSSChunk';

const filterExt = (
  auxiliaryFiles: Set<string>,
  assetPath: string,
  tenantName: string,
  ext: string,
) =>
  Array.from(auxiliaryFiles).filter(
    (assetFile) =>
      assetFile.startsWith(`/${assetPath}/${tenantName}`) &&
      new RegExp(`\\.${ext}(?:\\?.*)?$`).test(assetFile),
  );

const getDevAssets = (chunkData: ChunkHandler) => {
  const { auxiliaryFiles, assetDir, tenantName } = chunkData;
  return sortPaths(filterExt(auxiliaryFiles, assetDir, tenantName, 'css'));
};

const getProdAssets = (chunkData: ChunkHandler) => {
  const assets: string[] = [];
  createChunk(chunkData, assets, 'css', createCSSChunk);
  return assets;
};

const createCSSHandler = (isProd: boolean) => (isProd ? getProdAssets : getDevAssets);

export default createCSSHandler;
