const tsConfig = require('@dev/eslint/ts.config');
const baseConfig = require('@dev/eslint/base.config');
const reactConfig = require('@dev/eslint/react.config');

module.exports = [...baseConfig, ...tsConfig, ...reactConfig];
