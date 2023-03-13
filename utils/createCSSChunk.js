const cast = (filePath) => Number.parseInt(filePath.split('/')[1], 10);
const createCSSChunk = (assets, filePaths) => {
  const p = filePaths
    .sort((filePathA, filePathB) => cast(filePathA) < cast(filePathB))
    console.log(p);
    return p.map((filePath) => assets[filePath].source()).join('')
};

module.exports = createCSSChunk;
