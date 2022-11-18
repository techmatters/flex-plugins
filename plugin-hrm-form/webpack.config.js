const webpack = require('webpack')

module.exports = (config, { isProd, isDev, isTest }) => {
  /**
   * Customize the webpack by modifying the config object.
   * Consult https://webpack.js.org/configuration for more information
   */

  config.plugins.push(
    new webpack.EnvironmentPlugin([
      'REACT_HRM_BASE_URL',
      'REACT_SERVERLESS_BASE_URL',
    ]),
  );

  return config;
};
