/**
 * Copyright (C) 2021-2026 Technology Matters
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

/**
 * Builds the web app (npm run build, into dist/) and serves it while developing (npm run dev, on
 * port 5180), passing /api to the server package's dev API (port 5181).
 */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { hrmFormDefinitionsSrc, hrmFormDefinitionsReplacement } = require('./build-tools/hrmFormDefinitions.cjs');

module.exports = (env, argv) => {
  const production = argv.mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    entry: './src/main.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      // Hashed, so they can be cached for good (the deploy uploads assets/ that way)
      filename: 'assets/[name].[contenthash:8].js',
      chunkFilename: 'assets/[name].[contenthash:8].js',
      assetModuleFilename: 'assets/[name].[contenthash:8][ext]',
      clean: true,
    },
    devtool: production ? false : 'eval-cheap-module-source-map',
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.json'],
      alias: { '@hrm-form-definitions': hrmFormDefinitionsSrc },
    },
    module: {
      rules: [
        {
          oneOf: [
            // A file's text, e.g. the plugin's FeatureFlags.ts, whose comments describe the flags
            { resourceQuery: /raw/, type: 'asset/source' },
            { test: /\.md$/, type: 'asset/source' },
            {
              test: /\.[jt]sx?$/,
              exclude: /node_modules/,
              use: { loader: 'babel-loader', options: { configFile: path.resolve(__dirname, 'babel.config.cjs') } },
            },
            {
              test: /\.css$/,
              use: [production ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
            },
            { test: /\.(svg|png|jpe?g|gif|woff2?)$/, type: 'asset/resource' },
          ],
        },
      ],
    },
    plugins: [
      hrmFormDefinitionsReplacement(webpack),
      new HtmlWebpackPlugin({ template: 'index.html' }),
      new CopyWebpackPlugin({ patterns: [{ from: 'public', noErrorOnMissing: true }] }),
      ...(production ? [new MiniCssExtractPlugin({ filename: 'assets/[name].[contenthash:8].css' })] : []),
    ],
    optimization: {
      // Libraries change less often than the app, so they're cached separately
      splitChunks: { cacheGroups: { vendor: { test: /[\\/]node_modules[\\/]/, name: 'vendor', chunks: 'all' } } },
    },
    performance: { hints: false },
    devServer: {
      port: 5180,
      historyApiFallback: true,
      proxy: [{ context: ['/api'], target: `http://localhost:${process.env.FORM_BUILDER_API_PORT ?? 5181}` }],
      client: { overlay: { warnings: false } },
    },
  };
};
