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

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

const OUTPUT_FILENAME = 'webchat.min.js';
const DIST_CDN_DIR = 'dist/cdn';

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: argv.mode || 'production',
    context: __dirname,
    entry: './src/index.tsx',
    target: ['web', 'es5'],
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: `static/js/${OUTPUT_FILENAME}`,
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
      fallback: { path: false },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: { noEmit: false },
            },
          },
        },
      ],
    },
    optimization: {
      runtimeChunk: false,
      splitChunks: false,
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.APP_VERSION': JSON.stringify(require('./package.json').version),
        'process.env.WEBCHAT_VERSION': JSON.stringify(process.env.WEBCHAT_VERSION || ''),
        'process.env.REACT_APP_CONFIG_URL': JSON.stringify(process.env.REACT_APP_CONFIG_URL || ''),
        'process.env.REACT_APP_FORM_DEFINITIONS_BASE_URL': JSON.stringify(
          process.env.REACT_APP_FORM_DEFINITIONS_BASE_URL || '',
        ),
      }),
      new HtmlWebpackPlugin({ template: './public/index.html' }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            globOptions: { ignore: ['**/index.html'] },
          },
        ],
      }),
      ...(isProduction
        ? [
            new FileManagerPlugin({
              events: {
                onEnd: {
                  copy: [
                    {
                      source: `build/static/js/${OUTPUT_FILENAME}`,
                      destination: `${DIST_CDN_DIR}/${OUTPUT_FILENAME}`,
                    },
                  ],
                },
              },
            }),
          ]
        : []),
    ],
    ...(isProduction
      ? {}
      : {
          devServer: {
            static: false,
            historyApiFallback: true,
            hot: false,
            liveReload: true,
            port: Number(process.env.PORT) || 3000,
          },
        }),
  };
};
