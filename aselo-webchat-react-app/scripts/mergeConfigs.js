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

const fs = require('fs/promises');
const merge = require('lodash.merge');
const DEFAULT_LANGUAGE = 'en';

const generateMergedConfigs = async (environment, helplineCode) => {
  const defaults = JSON.parse(await fs.readFile('./configSrc/defaults.json', { encoding: 'utf8' }));
  const defaultTranslations = JSON.parse(
    await fs.readFile(`./translationsSrc/${DEFAULT_LANGUAGE}.json`, { encoding: 'utf8' }),
  );

  // Build an array of the target helplines. If not specified, use the fs structure, where a folder represents a helpline
  const helplineCodes = [];
  if (helplineCode) {
    helplineCodes.push(helplineCode);
  } else {
    const contents = await fs.readdir('./configSrc/', { recursive: false, withFileTypes: true });
    const directories = contents.filter(ent => ent.isDirectory()).map(({ name }) => name);
    helplineCodes.push(...directories);
  }

  for (const shortCode of helplineCodes) {
    const helplineCommon = JSON.parse(await fs.readFile(`./configSrc/${shortCode}/common.json`, { encoding: 'utf8' }));

    // Build an array of the target environments. If not specified, use the fs structure, where all the .json files other than "common" represent an environment
    const environments = [];
    if (environment) {
      environments.push(environment);
    } else {
      const contents = await fs.readdir(`./configSrc/${shortCode}/`, { recursive: false, withFileTypes: true });
      const envs = contents
        .filter(ent => !ent.isDirectory())
        .filter(ent => ent.isFile() && ent.name.endsWith('.json') && ent.name !== 'common.json')
        .map(({ name }) => name.slice(0, -5));
      environments.push(...envs);
    }

    // Assume the languages required by the helpline based on the translation files that exist in the helplines 'translations' directory under their entry in configSrc
    // e.g. ./configSrc/as/translations/en-US.json
    // Should a helpline need to support a language but require no helpline specific translations, add a file with an empty json object in it
    const contents = await fs.readdir(`./configSrc/${shortCode}/translations`, {
      recursive: false,
      withFileTypes: true,
    });

    const mergedTranslations = {};
    const helplineTranslationFilenames = contents
      .filter(ent => ent.isFile() && ent.name.endsWith('.json'))
      .map(({ name }) => name);
    for (const translationFilename of helplineTranslationFilenames) {
      const helplineTranslations = JSON.parse(
        await fs.readFile(`./configSrc/${shortCode}/translations/${translationFilename}`, { encoding: 'utf8' }),
      );
      let localeTranslations = {};
      const localeTranslationsPath = `./translationsSrc/${translationFilename}`;
      try {
        localeTranslations = JSON.parse(await fs.readFile(localeTranslationsPath, { encoding: 'utf8' }));
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.info(`No locale translations at ${localeTranslationsPath}, skipping`);
        } else {
          console.info(`Failed to read locale translations at ${localeTranslationsPath}, assuming there are none`, err);
        }
      }
      let languageTranslations = {};
      const [localeName] = translationFilename.split('.');
      const [languageName] = localeName.split('-');
      const languageTranslationsPath = `./translationsSrc/${languageName}.json`;
      try {
        languageTranslations = JSON.parse(await fs.readFile(languageTranslationsPath, { encoding: 'utf8' }));
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.info(`No language translations at ${languageTranslationsPath}, skipping`);
        } else {
          console.info(
            `Failed to read language translations at ${languageTranslationsPath}, assuming there are none`,
            err,
          );
        }
      }
      mergedTranslations[translationFilename.split('.')[0]] = merge(
        defaultTranslations,
        languageTranslations,
        localeTranslations,
        helplineTranslations,
      );
    }

    for (const env of environments) {
      const environmentSpecific = JSON.parse(
        await fs.readFile(`./configSrc/${shortCode}/${env}.json`, { encoding: 'utf8' }),
      );

      const mergedConfig = merge(defaults, helplineCommon, environmentSpecific, { translations: mergedTranslations });
      await fs.mkdir(`./mergedConfigs/${shortCode}`, { recursive: true });
      await fs.writeFile(`./mergedConfigs/${shortCode}/${env}.json`, JSON.stringify(mergedConfig, null, 2));
      console.info(`Merged configs generated for ${shortCode}/${env}`);
    }
  }
};

generateMergedConfigs(process.argv[2], process.argv[3]).then(
  () => console.info(`Merged configs completed.`),
  err => console.error(`Error generating merged configs for ${process.argv[2]} ${process.argv[3]}.`, err),
);
