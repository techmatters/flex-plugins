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

import { TextEncoder, TextDecoder } from 'util';

import { configure } from 'enzyme/build';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17/build';

require('babel-polyfill');

configure({
  adapter: new Adapter(),
});

// Workaround for jsdom not supporting media elements: https://github.com/jsdom/jsdom/issues/2155
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => undefined;

/* This fixes the ReferenceError: TextDecoder is not defined and the TypeError: Cannot read properties of null (reading '_origin') errors
 https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest 
*/
Object.assign(global, { TextDecoder, TextEncoder });
