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

import { isNotCategory, isNotSubcategory } from '../../states/ContactFormStateFactory';

describe('isNotCategory', () => {
  test('returns true', () => {
    expect(isNotCategory('error')).toBe(true);
    expect(isNotCategory('touched')).toBe(true);
    expect(isNotCategory('type')).toBe(true);
    expect(isNotCategory('validation')).toBe(true);
  });

  test('returns false', () => {
    expect(isNotCategory('Missing children')).toBe(false);
    expect(isNotCategory('Violence')).toBe(false);
    expect(isNotCategory('Mental Health')).toBe(false);
  });
});

describe('isNotSubcategory', () => {
  test('returns true', () => {
    expect(isNotSubcategory('type')).toBe(true);
  });

  test('returns false', () => {
    expect(isNotSubcategory('Child abduction')).toBe(false);
    expect(isNotSubcategory('Bullying')).toBe(false);
    expect(isNotSubcategory('Addictive behaviours')).toBe(false);
  });
});
