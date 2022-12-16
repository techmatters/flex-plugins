const DotenvFlow = require('dotenv-flow-webpack');

module.exports = (config, { isProd, isDev, isTest }) => {
  /**
   * Customize the webpack by modifying the config object.
   * Consult https://webpack.js.org/configuration for more information
   */

  config.plugins.push(
    new DotenvFlow({
      // eslint-disable-next-line camelcase
      system_vars: true,
    }),
  );
  return config;
};
