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
