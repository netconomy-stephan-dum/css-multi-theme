const path = require('node:path');
const shortenPath = (filePath) => {
  const base = path.basename(filePath, '.scss');
  return filePath.replace(`${base}/${base}.scss`, `${base}.scss`);
};

module.exports = shortenPath;
