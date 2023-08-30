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

type LocaleMap = {
  [key: string]: string;
};

const localeMap: LocaleMap = {
  'en-US': 'en',
  'en-CA': 'en',
  es: 'es',
  'es-CL': 'es',
  'es-CO': 'es',
  'fr-CA': 'fr',
  'hu-HU': 'hu',
  'ukr-HU': 'uk',
  'ukr-MT': 'uk',
  'ru-HU': 'ru',
};

// https://github.com/missive/emoji-mart#options--props
export const getLocale = (language: string) => localeMap[language];
