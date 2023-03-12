const { RawSource } = require("webpack-sources");
const createChunk = (compilation, chunkAssets, tenantName, id, assets, ext, createSource, targetExt = ext) => {
  const fileRegEx = new RegExp(`\.${ext}$`);
  const files = chunkAssets.filter((assetFile) => assetFile.startsWith(tenantName) && fileRegEx.test(assetFile));

  if (!files.length) {
    return null;
  }

  const rawSource = createSource(compilation.assets, files);
  const filePath = `assets/${tenantName}/${targetExt}/${id}.${targetExt}`;
  assets.push(filePath);
  compilation.assets[filePath] = new RawSource(rawSource);
  const chunk = compilation.addChunk(filePath);
  chunk.auxiliaryFiles.add(filePath);
  chunk.files.add(filePath);
  chunk.id = tenantName+'-'+id+'-'+targetExt;
  chunk.ids = [chunk.id];

  files.forEach((file) => {
    compilation.deleteAsset(file);
  });
};

module.exports = createChunk;
