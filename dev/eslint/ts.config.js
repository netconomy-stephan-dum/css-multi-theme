const tsESLint = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');

const TSLintConfig = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsESLint,
    },
    rules: {
      ...tsESLint.configs.recommended.rules,
      ...tsESLint.configs['eslint-recommended'].overrides[0].rules,
      'init-declarations': 'off',
      'no-var': 'off',
      'vars-on-top': 'off',
    },
  },
];

module.exports = TSLintConfig;
