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
import type { PermissionRules } from '@tech-matters/form-builder-shared';

import {
  casesUnused,
  describeFieldRule,
  describeRule,
  formatPermissionRules,
  PERMISSION_ACTIONS,
  permissionIssues,
  summarizePermissionChanges,
} from './permissions';

// Every action, as USNM's file has them (no cases)
const usnmLike = (): PermissionRules => ({
  ...Object.fromEntries(PERMISSION_ACTIONS.map(action => [action.key, [['isSupervisor']]])),
  viewCase: [],
  closeCase: [],
  reopenCase: [],
  caseStatusTransition: [],
  addCaseSection: [],
  editCaseSection: [],
  editCaseOverview: [],
  updateCaseContacts: [],
  viewContact: [['isSupervisor'], ['isOwner']],
  viewContactField: [],
  editContactField: [],
});

describe('permissions', () => {
  test('rules in words', () => {
    expect(describeRule([])).toBe('Nobody');
    expect(describeRule([['isSupervisor'], ['isOwner']])).toBe('Supervisors; or the contact’s owner');
    expect(describeRule([['isSupervisor', { createdHoursAgo: 24 }]])).toBe(
      'Supervisors and created less than 24 hours ago',
    );
    expect(describeFieldRule([[{ field: 'rawJson.caseInformation.lastName' }, 'isSupervisor'], ['everyone']])).toEqual({
      everyField: 'Everyone',
      fields: [{ field: '“lastName” (Case information)', who: 'Supervisors' }],
    });
  });

  test('what HRM would refuse: a missing action, a condition it doesn’t take, two fields in one way', () => {
    expect(permissionIssues(usnmLike())).toEqual([]);
    const { viewRecording: _gone, ...missing } = usnmLike();
    expect(permissionIssues(missing)).toEqual([
      expect.objectContaining({ action: 'viewRecording', severity: 'error' }),
    ]);
    const wrong = {
      ...usnmLike(),
      viewCase: [['isOwner']],
      createProfileSection: [[{ sectionType: 'summary' }]],
      viewIdentifiers: [['isOwner']],
      viewContactField: [[{ field: 'rawJson.caseInformation.a' }, { field: 'rawJson.caseInformation.b' }]],
      viewPostSurvey: [[{ createdDaysAgo: 0 }], []],
    };
    const issues = permissionIssues(wrong);
    expect(issues.filter(issue => issue.severity === 'error').map(issue => issue.action)).toEqual([
      'viewCase',
      'viewContactField',
      'createProfileSection',
      'viewPostSurvey',
      'viewIdentifiers',
    ]);
    expect(issues.find(issue => issue.severity === 'warning')?.message).toMatch(/never allows anyone/);
  });

  test('cases nobody can do anything with aren’t used', () => {
    expect(casesUnused(usnmLike())).toBe(true);
    expect(casesUnused({ ...usnmLike(), viewCase: [['isSupervisor']] })).toBe(false);
  });

  test('written as the hrm repo writes them, in the file’s own order', () => {
    const text = formatPermissionRules({ ...usnmLike(), editChildIsAtRisk: [['isSupervisor']] });
    expect(text).toContain('  "viewContact": [["isSupervisor"], ["isOwner"]],\n');
    expect(text).toContain('  "updateCaseContacts": [],\n\n  "viewContact"');
    // (a key HRM doesn't know stays with the block it's in)
    expect(text).toContain(
      '"viewPostSurvey": [["isSupervisor"]],\n\n  "viewIdentifiers": [["isSupervisor"]],\n  "editChildIsAtRisk"',
    );
    expect(text.endsWith('  "editChildIsAtRisk": [["isSupervisor"]]\n}\n')).toBe(true);
    expect(JSON.parse(text)).toEqual({ ...usnmLike(), editChildIsAtRisk: [['isSupervisor']] });
    expect(
      formatPermissionRules({ viewContactField: [[{ field: 'rawJson.caseInformation.x' }, 'isSupervisor']] }),
    ).toBe('{\n  "viewContactField": [[{"field": "rawJson.caseInformation.x"}, "isSupervisor"]]\n}\n');
  });

  test('what changed, per action', () => {
    expect(summarizePermissionChanges(usnmLike(), { ...usnmLike(), viewCase: [['isSupervisor']] })).toEqual([
      'See a case: Nobody → Supervisors',
    ]);
  });
});
