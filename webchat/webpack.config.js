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

const path = require('path');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const { checkMODE, setConfigFile } = require('./utils');

const mode = process.env.MODE || 'production'; // If not provided, assume is building production version
const config = process.env.CONFIG;
checkMODE(mode);
setConfigFile(config);

const isDevMode = mode === 'development';
const devtool = isDevMode ? 'eval-source-map' : undefined;

const webpackConfig = {
  mode,
  devtool,
  devServer: {
    static: {
      directory: path.join(__dirname, './'),
    },
    compress: true,
    port: 9000,
    open: true,
    hot: true,
  },
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-typescript', ['@babel/preset-react', { targets: 'defaults' }]],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.json?$/,
        type: 'javascript/auto',
        use: {
          loader: 'raw-loader',
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
    fallback: {
      buffer: require.resolve('buffer'),
      fs: false,
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: false, // This prevents webpack from injecting <script defer src='./bundle.js'></script> in the header
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      // Here it creates webpack.env.CONFIG from the env var CONFIG
      'webpack.env.CONFIG': JSON.stringify(process.env.CONFIG),
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'assets' }],
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin({
      overlay: false,
    }),
  ],
  externals: {
    // eslint-disable-next-line global-require
    fs: require('fs'),
  },
};

if (process.env.BUNDLE_ANALYZER) {
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = webpackConfig;
