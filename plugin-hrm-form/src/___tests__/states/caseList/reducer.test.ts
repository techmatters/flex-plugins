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

import { reduce, undoCaseListSettingsUpdate } from '../../../states/caseList/reducer';
import { ListCasesSortBy, ListCasesSortDirection } from '../../../types/types';
import { caseListContentInitialState } from '../../../states/caseList/listContent';

describe('reduce', () => {
  describe('UNDO_CASE_LIST_SETTINGS_UPDATE', () => {
    const currentSettings = {
      filter: {
        counsellors: [],
        statuses: ['a status'],
        includeOrphans: false,
      },
      page: 1337,
      sort: {
        sortBy: ListCasesSortBy.CHILD_NAME,
        sortDirection: ListCasesSortDirection.DESC,
      },
    };
    const previousSettings = {
      filter: {
        counsellors: ['something'],
        statuses: [],
        includeOrphans: false,
      },
      page: 42,
      sort: {
        sortBy: ListCasesSortBy.FOLLOW_UP_DATE,
        sortDirection: ListCasesSortDirection.ASC,
      },
    };

    test('previousSetting exists - makes current setting previous setting, and previous setting undefined', () => {
      const updatedState = reduce(
        {
          currentSettings,
          previousSettings,
          content: caseListContentInitialState(),
        },
        undoCaseListSettingsUpdate(),
      );
      expect(updatedState).toStrictEqual({
        currentSettings: previousSettings,
        previousSettings: undefined,
        content: caseListContentInitialState(),
      });
    });

    test('previousSetting exists - makes current setting previous setting, and previous setting undefined', () => {
      const updatedState = reduce(
        {
          currentSettings,
          previousSettings: undefined,
          content: caseListContentInitialState(),
        },
        undoCaseListSettingsUpdate(),
      );
      expect(updatedState).toStrictEqual({
        currentSettings,
        previousSettings: undefined,
        content: caseListContentInitialState(),
      });
    });
  });
});
