const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
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

  if (process.env.BUNDLE_ANALYZER === 'true') {
    config.plugins.push(
      new BundleAnalyzerPlugin(),
    );
  }

  return config;
};
