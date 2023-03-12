const createCSSChunk = (assets, filePaths) => filePaths.map((filePath) => assets[filePath].source()).join('');

module.exports = createCSSChunk;
