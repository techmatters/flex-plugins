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

import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIGURATIONS_PATH = join(__dirname, '../configSrc');

const main = environment => {
  const helplineCodes = [];
  const contents = readdirSync(CONFIGURATIONS_PATH, { recursive: false, withFileTypes: true });
  const directories = contents.filter(ent => ent.isDirectory()).map(({ name }) => name);
  helplineCodes.push(...directories);

  const targetHelplines = [];
  for (const shortCode of helplineCodes) {
    const contents = readdirSync(`${CONFIGURATIONS_PATH}/${shortCode}`, { recursive: false, withFileTypes: true });
    const isTargetHelpline = contents.some(ent => ent.isFile() && ent.name === `${environment}.json`);
    if (isTargetHelpline) {
      targetHelplines.push(shortCode.toUpperCase());
    }
  }

  console.log(JSON.stringify(targetHelplines));
};

main(process.argv[2]);
