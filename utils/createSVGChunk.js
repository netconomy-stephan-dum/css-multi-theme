const path = require("node:path");

const createSVGChunk = (assets, filePaths) => {
  const symbols = [];
  filePaths.forEach((filePath) => {
    // TODO: strip xmlns! also width & height
    symbols.push(assets[filePath].source()
      .replace(/^<svg /, `<symbol id="${path.basename(filePath, '.svg')}" `)
      .replace(/<\/svg>$/, '</symbol>')
    );
  });
  return `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('\n')}</svg>`;
};

module.exports = createSVGChunk;

