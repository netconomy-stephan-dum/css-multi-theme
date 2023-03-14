const cast = (filePath) => Number.parseInt(filePath.split('/')[1], 10);
const createCSSChunk = (assets, filePaths) => filePaths
    .sort((filePathA, filePathB) => cast(filePathA) < cast(filePathB))
    .map((filePath) => assets[filePath].source()).join('');

module.exports = createCSSChunk;
