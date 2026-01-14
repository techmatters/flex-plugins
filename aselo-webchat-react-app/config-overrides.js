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

const FileManagerPlugin = require('filemanager-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

const OUTPUT_FILENAME = "webchat.min.js"
const DIST_CDN_DIR = "dist/cdn"

module.exports = function override(config) {
    // ⬇ Output a single file
    delete config.output.chunkFilename;
    delete config.optimization.runtimeChunk;
    delete config.optimization.splitChunks;

    // ⬇ Remove hash from filename
    config.output.filename = `static/js/${OUTPUT_FILENAME}`;

    // ⬇ Prevent (missing) node fallback on path module
    config.resolve.fallback = { ...(config.resolve.fallback || {}), path: false };

    config.plugins = [
        ...config.plugins,
        new FileManagerPlugin({
              events: {
                  onEnd: {
                      copy: [{ source: `build/static/js/${OUTPUT_FILENAME}`, destination: `${DIST_CDN_DIR}/${OUTPUT_FILENAME}` }]
                  }
              }
        }),
        new webpack.DefinePlugin({
            "process.env.APP_VERSION": JSON.stringify(require("./package.json").version),
            "process.env.WEBCHAT_VERSION": JSON.stringify(dotenv.config().parsed.WEBCHAT_VERSION),
            "process.env.REACT_APP_CONFIG_URL": process.env.REACT_APP_CONFIG_URL,
        })
    ];
    return config;
};
