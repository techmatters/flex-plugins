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

import { describe, expect, test } from 'vitest';
import { isProtectedField } from './specification';
import { CONTACT_TABS, ContactTab } from './definitions';

const tab = (key: ContactTab['key']) => CONTACT_TABS.find((candidate) => candidate.key === key)!;

describe('specification', () => {
  test('marks fields the Aselo specification requires as protected', () => {
    expect(isProtectedField(tab('CaseInformationTab'), 'callSummary')).toBe(true);
    expect(isProtectedField(tab('ChildInformationTab'), 'age')).toBe(true);
    expect(isProtectedField(tab('ChildInformationTab'), 'firstName')).toBe(false);
    expect(isProtectedField(tab('CallerInformationTab'), 'someCustomField')).toBe(false);
  });
});
