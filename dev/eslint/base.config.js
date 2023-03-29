const { FlatCompat } = require('@eslint/eslintrc');
const PrettierConfig = require('eslint-config-prettier');
const PrettierPlugin = require('eslint-plugin-prettier');
const js = require('@eslint/js');
const cjsConfig = require('./cjs.config');

const compat = new FlatCompat();
const baseConfig = [
  js.configs.all,
  {
    ignores: ['**/node_modules/*', '**/dist/*', '**/.*'],
  },
  {
    rules: {
      'capitalized-comments': 'off',
      'line-comment-position': 'off',
      'max-lines-per-function': ['error', 100],
      'max-params': 'off',
      'multiline-comment-style': 'off',
      'no-empty-function': 'off',
      'no-inline-comments': 'off',
      'no-invalid-this': 'off',
      'no-magic-numbers': 'off',
      'no-ternary': 'off',
      'no-underscore-dangle': 'off',
      'no-warning-comments': 'off',
      'one-var': 'off',
      'prefer-named-capture-group': 'off',
      'require-unicode-regexp': 'off',
      'sort-imports': 'off',
      strict: 'off',
    },
  },
  ...compat.config(PrettierPlugin.configs.recommended),
  ...compat.config(PrettierConfig),
  {
    files: ['**/eslint.config.js', '**/*.cjs'],
    ...cjsConfig,
  },
];

module.exports = baseConfig;
