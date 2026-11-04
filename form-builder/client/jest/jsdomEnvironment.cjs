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
 * Tests only: the browser (jsdom), plus what browsers have that jsdom doesn't: fetch and its
 * Request, Response and Headers, TextEncoder and TextDecoder, structuredClone, and crypto.subtle
 * (signing in hashes with it). They're Node's own, which behave the same.
 * UI tests use it with a docblock: / ** @jest-environment ./jest/jsdomEnvironment.cjs * /
 */
const { TestEnvironment } = require('jest-environment-jsdom');

const FROM_NODE = ['fetch', 'Request', 'Response', 'Headers', 'TextEncoder', 'TextDecoder', 'structuredClone'];

class JsdomEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context);
    FROM_NODE.forEach(name => {
      if (this.global[name] === undefined) this.global[name] = globalThis[name];
    });
    if (!this.global.crypto?.subtle) {
      Object.defineProperty(this.global, 'crypto', { value: globalThis.crypto, configurable: true });
    }
  }
}

module.exports = JsdomEnvironment;
