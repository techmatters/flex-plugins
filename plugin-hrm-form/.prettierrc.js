const baseConfig = require('./node_modules/eslint-config-twilio/rules/prettier');

module.exports = {
  ...baseConfig,
  ...{
    arrowParens: 'avoid',
    singleQuote: true,
    endOfLine: 'auto',
  },
};
