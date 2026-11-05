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
import { describe, expect, test } from '@jest/globals';

import { getChangedFilePaths } from '../drafts/changes';
import { isSectionChanged } from './sectionChanges';
import type { View } from './workspaceSlice';

const original = {
  'tabbedForms/CallerInformationTab.json': [{ name: 'firstName' }],
  'PrepopulateMappings.json': { formSelector: { selectorType: 'static' }, preEngagement: { age: 'age' } },
  'CaseStatus.json': {},
};

const changedIn = (files: Record<string, unknown>, view: View) =>
  isSectionChanged(view, getChangedFilePaths(original, files), original, files, target =>
    target.kind === 'contactTab' ? `tabbedForms/${target.tabKey}.json` : undefined,
  );

describe('sections the draft changes', () => {
  test('a form by its own file; other sections by the files they write', () => {
    const files = { ...original, 'tabbedForms/CallerInformationTab.json': [{ name: 'lastName' }] };
    expect(changedIn(files, { kind: 'contactTab', tabKey: 'CallerInformationTab' })).toBe(true);
    expect(changedIn(files, { kind: 'contactTab', tabKey: 'ChildInformationTab' })).toBe(false);
    expect(changedIn(files, { kind: 'caseStatus' })).toBe(false);
    expect(changedIn({ ...original, 'CaseStatus.json': { open: {} } }, { kind: 'caseStatus' })).toBe(true);
  });

  test('a shared file marks the section whose part changed', () => {
    const files = {
      ...original,
      'PrepopulateMappings.json': { formSelector: { selectorType: 'choice' }, preEngagement: { age: 'age' } },
    };
    expect(changedIn(files, { kind: 'formSelector' })).toBe(true);
    expect(changedIn(files, { kind: 'webchat' })).toBe(false);
  });
});
