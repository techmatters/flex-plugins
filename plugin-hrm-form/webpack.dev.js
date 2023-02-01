module.exports = (config, { isProd, isDev, isTest }) => {
  /**
   * Customize the webpack dev-server by modifying the config object.
   * Consult https://webpack.js.org/configuration/dev-server for more information.
   */

  console.dir(config);

  config.publicPath = '/';
  config.contentBase = '/';
  console.dir(config);

  return config;
};
