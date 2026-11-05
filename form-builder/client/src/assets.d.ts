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

// What webpack gives for files that aren't code (webpack.config.cjs)

// A file's text: '<file>?raw'
declare module '*?raw' {
  const text: string;
  // eslint-disable-next-line import/no-unused-modules -- declares the type of the ?raw imports
  export default text;
}

// Stylesheets are added to the page
declare module '*.css';
