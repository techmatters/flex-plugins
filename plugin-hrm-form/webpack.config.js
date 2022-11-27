const DotEnvWebpack = require('dotenv-webpack');

module.exports = (config, { isProd, isDev, isTest }) => {
  /**
   * Customize the webpack by modifying the config object.
   * Consult https://webpack.js.org/configuration for more information
   */

  const envPath = isDev ? '.env.dev' : '.env.prod';
  if (envPath) {
    config.plugins.push(
      new DotEnvWebpack({
        path: envPath,
        // Safe to load up system env vars because it only writes those that are explicitly referenced in code anyway, see https://github.com/mrsteele/dotenv-webpack
        systemvars: true,
      }),
    );
  }
  return config;
};
