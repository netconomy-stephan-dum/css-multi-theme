const path = require('node:path');

const dist = 'dist';
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const base = process.cwd();

const universalConfig = {
  entry: {
    index: path.join(base, 'universal.ts'),
  },
  experiments: {
    outputModule: true,
  },
  externalsType: 'module',
  mode,
  name: 'universal',
  output: {
    chunkFormat: 'module',
    environment: {
      module: true,
    },
    filename: './[name]_[contenthash].js',
    library: {
      type: 'module',
    },
    module: true,
    path: path.join(base, dist, 'public/modules'),
    publicPath: '/',
  },
  target: 'es2020',
};

module.exports = universalConfig;
