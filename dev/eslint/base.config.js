const { FlatCompat } = require('@eslint/eslintrc');
const PrettierConfig = require('eslint-config-prettier');
const PrettierPlugin = require('eslint-plugin-prettier');
const js = require('@eslint/js');
const cjsConfig = require('./cjs.config');

const compat = new FlatCompat();
const baseConfig = [
  js.configs.all,
  ...compat.config(PrettierPlugin.configs.recommended),
  ...compat.config(PrettierConfig),
  {
    rules: {
      'capitalized-comments': 'off',
      'func-names': 'off',
      'import/namespace': 'off',
      'import/no-extraneous-dependencies': 'off',
      'init-declarations': 'off',
      'max-params': 'off',
      'no-invalid-this': 'off',
      'no-ternary': 'off',
      'one-var': 'off',
      'prefer-named-capture-group': 'off',
      'require-unicode-regexp': 'off',
      'sort-imports': 'off',
    },
  },
  {
    files: ['**/eslint.config.js'],
    ...cjsConfig,
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      ...cjsConfig.rules,
    },
  },
];

module.exports = baseConfig;
