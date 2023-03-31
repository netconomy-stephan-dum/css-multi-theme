const path = require('node:path');

const dist = 'dist';
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const base = process.cwd();

const browserConfig = {
  entry: {
    index: path.join(base, 'browser.ts'),
  },
  mode,
  name: 'browser-engine',
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  output: {
    filename: './[name]_[contenthash].js',
    path: path.join(base, dist, 'public'),
    publicPath: '/',
    // library: ['__externals', '[name]'],
  },
  target: 'web',
};

module.exports = browserConfig;
