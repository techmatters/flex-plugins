import { reduce, undoCaseListSettingsUpdate } from '../../../states/caseList/reducer';
import { DateExistsCondition } from '../../../components/caseList/filters/dateFilters';
import { ListCasesSortBy, ListCasesSortDirection } from '../../../types/types';

const baselineDate = new Date(2012, 11, 3);
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
        },
        undoCaseListSettingsUpdate(),
      );
      expect(updatedState).toStrictEqual({
        currentSettings: previousSettings,
        previousSettings: undefined,
      });
    });

    test('previousSetting exists - makes current setting previous setting, and previous setting undefined', () => {
      const updatedState = reduce(
        {
          currentSettings,
          previousSettings: undefined,
        },
        undoCaseListSettingsUpdate(),
      );
      expect(updatedState).toStrictEqual({
        currentSettings,
        previousSettings: undefined,
      });
    });
  });
});
