const reactRecommended = require('eslint-plugin-react/configs/recommended');

const ReactLintConfig = [
  {
    files: ['**/*.jsx', '**/*.tsx'],
    ...reactRecommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];

module.exports = ReactLintConfig;
