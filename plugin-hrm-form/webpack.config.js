/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
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
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  return config;
};
