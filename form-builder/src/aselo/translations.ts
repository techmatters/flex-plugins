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
 * The text counselors see, worked out the same way as the Flex plugin
 * (plugin-hrm-form/src/translations/index.ts):
 *
 *   en.json -> <base language>.json -> <locale>.json -> helpline Substitutions[<base language>]
 *
 * Field labels go through the same lookup, so a label can be a translation key.
 */
import { useEffect, useState } from 'react';
import type { DefinitionFileMap } from '../definitions';

export type Strings = Record<string, string>;

// The plugin's translation files, each loaded only when that language is needed
const translationFiles = import.meta.glob<Strings>('../../../plugin-hrm-form/src/translations/*.json', {
  import: 'default',
});

// Languages the plugin has text for, e.g. ['en', 'en-US', 'es', 'es-CL', ...]
export const AVAILABLE_LANGUAGES = Object.keys(translationFiles)
  .map((filePath) => filePath.split('/').pop()!.replace('.json', ''))
  .sort();

const loadFile = async (name: string): Promise<Strings> => {
  const loader = translationFiles[`../../../plugin-hrm-form/src/translations/${name}.json`];
  return loader ? loader() : {};
};

const SUBSTITUTIONS_FILE = 'customStrings/Substitutions.json';

export const loadStrings = async (
  language: string,
  files: DefinitionFileMap,
): Promise<Strings> => {
  const [baseLanguage] = language.split('-');
  const substitutions = (files[SUBSTITUTIONS_FILE] ?? {}) as Record<string, Strings>;
  return {
    ...(await loadFile('en')),
    ...(baseLanguage !== 'en' ? await loadFile(baseLanguage) : {}),
    ...(language !== baseLanguage ? await loadFile(language) : {}),
    ...(substitutions[baseLanguage] ?? {}),
  };
};

export const useStrings = (language: string, files: DefinitionFileMap): Strings => {
  const [strings, setStrings] = useState<Strings>({});
  useEffect(() => {
    let current = true;
    loadStrings(language, files).then((loaded) => {
      if (current) setStrings(loaded);
    });
    return () => {
      current = false;
    };
  }, [language, files]);
  return strings;
};

/**
 * Looks up a translation key (falling back to the text itself) and fills in {{name}}
 * placeholders, like Flex's <Template code="..." /> does.
 */
export const translate = (
  strings: Strings,
  code: string | undefined,
  values: Record<string, string | number> = {},
): string =>
  (strings[code ?? ''] ?? code ?? '').replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) =>
    name in values ? String(values[name]) : match,
  );
