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

const fs = require("fs/promises");
const merge = require("lodash.merge");

const generateMergedConfigs = async (environment) => {
    const defaults = JSON.parse(await fs.readFile('./configSrc/defaults.json', 'utf8'));
    const contents =  await fs.readdir('./configSrc/', { recursive: false, withFileTypes: true });
    const directories = contents.filter((ent) => ent.isDirectory()).map(({ name }) => name)
    for (const shortCode of directories) {

        const helplineCommon = JSON.parse(await fs.readFile(`./configSrc/${shortCode}/common.json`, 'utf8'));
        const environmentSpecific = JSON.parse(await fs.readFile(`./configSrc/${shortCode}/${environment}.json`, 'utf8'));
        await fs.mkdir(`./mergedConfigs/${shortCode}`, { recursive: true });
        await fs.writeFile(`./mergedConfigs/${shortCode}/${environment}.json`, JSON.stringify(merge(defaults, helplineCommon, environmentSpecific), null, 2))
    }
}

generateMergedConfigs(process.argv[2]).then(
    () => console.info(`Merged logs generated for ${process.argv[2]}.`),
    (err) => console.error(`Error generating merged configs for ${process.argv[2]}.`, err)
);