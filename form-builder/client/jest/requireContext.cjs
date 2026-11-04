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
 * Tests only: what webpack's require.context gives, read from disk. JSON files are parsed, other
 * files that aren't code (e.g. Markdown) come as their text, code is required. 'lazy' returns
 * promises, as webpack does.
 */
const fs = require('fs');
const path = require('path');

const filesIn = (dir, recursive) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return recursive ? filesIn(full, recursive) : [];
    return [full];
  });

const load = (file) => {
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (/\.[cm]?[jt]sx?$/.test(file)) return require(file);
  return fs.readFileSync(file, 'utf8');
};

module.exports = (fromDir, dir, recursive = true, regExp = /^\.\/.*$/, mode = 'sync') => {
  const root = path.resolve(fromDir, dir);
  const byKey = new Map(
    filesIn(root, recursive)
      .map((file) => [`./${path.relative(root, file).split(path.sep).join('/')}`, file])
      .filter(([key]) => regExp.test(key)),
  );
  const context = (key) => {
    const file = byKey.get(key);
    if (!file) throw new Error(`Cannot find module '${key}' in ${root}`);
    return mode === 'lazy' ? Promise.resolve(load(file)) : load(file);
  };
  context.keys = () => [...byKey.keys()];
  context.resolve = (key) => byKey.get(key);
  context.id = root;
  return context;
};
