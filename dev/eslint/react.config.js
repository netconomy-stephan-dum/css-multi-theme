const { FlatCompat } = require("@eslint/eslintrc");
const react = require("eslint-plugin-react");
const ESImport = require("eslint-plugin-import");

const compat = new FlatCompat();

const ReactLintConfig = [
  ...compat.config(ESImport.configs.recommended),
  ...compat.config(react.configs.recommended),
  {
    settings: {
      react: {
        version: "detect",
      },
    }
  }
];

module.exports = ReactLintConfig;
