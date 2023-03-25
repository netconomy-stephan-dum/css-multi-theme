const {FlatCompat} = require("@eslint/eslintrc");
const path = require("node:path");
const tsESLint = require("@typescript-eslint/eslint-plugin");
const baseConfig = require('./base.config');

const TSLintConfig = [
  ...new FlatCompat({
    baseDirectory: path.join(path.dirname(require.resolve('@typescript-eslint/eslint-plugin/package.json')), 'dist')
  }).config(tsESLint.configs.recommended),
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  ...baseConfig
];

module.exports = TSLintConfig;
