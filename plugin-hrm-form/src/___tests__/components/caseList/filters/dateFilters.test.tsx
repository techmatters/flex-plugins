import { addDays, addSeconds, subDays } from 'date-fns';

import {
  DateExistsCondition,
  dateFilterOptionsAreEqual,
  dateFilterPayloadFromFilters,
} from '../../../../components/caseList/filters/dateFilters';

const baseline = new Date(2000, 10, 14);

describe('dateFilterOptionsAreEqual', () => {
  test('Different option names are never equal', () => {
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { exists: DateExistsCondition.MUST_NOT_EXIST, titleKey: 'something' }],
        ['not option 1', { exists: DateExistsCondition.MUST_NOT_EXIST, titleKey: 'something' }],
      ),
    ).toBeFalsy();
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { from: baseline, to: baseline, __fixedDateRange: 'fixedDateRange', titleKey: 'something' }],
        ['not option 1', { from: baseline, to: baseline, __fixedDateRange: 'fixedDateRange', titleKey: 'something' }],
      ),
    ).toBeFalsy();
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { from: () => new Date(), to: () => new Date(), titleKey: 'something' }],
        ['not option 1', { from: () => new Date(), to: () => new Date(), titleKey: 'something' }],
      ),
    ).toBeFalsy();
  });
  test('Both undefined are equal', () => {
    expect(dateFilterOptionsAreEqual(undefined, undefined)).toBeTruthy();
  });
  test('Fixed ranges with different dates are not equal', () => {
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { from: baseline, __fixedDateRange: 'fixedDateRange', titleKey: 'something' }],
        ['option 1', { to: baseline, __fixedDateRange: 'fixedDateRange', titleKey: 'something' }],
      ),
    ).toBeFalsy();
    expect(
      dateFilterOptionsAreEqual(
        [
          'option 1',
          { from: baseline, to: addDays(baseline, 1), __fixedDateRange: 'fixedDateRange', titleKey: 'something' },
        ],
        [
          'option 1',
          { from: baseline, to: addDays(baseline, 2), __fixedDateRange: 'fixedDateRange', titleKey: 'something' },
        ],
      ),
    ).toBeFalsy();
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { from: baseline, __fixedDateRange: 'fixedDateRange', titleKey: 'something' }],
        ['option 1', { from: addSeconds(baseline, 10), __fixedDateRange: 'fixedDateRange', titleKey: 'something' }],
      ),
    ).toBeFalsy();
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { to: baseline, __fixedDateRange: 'fixedDateRange', titleKey: 'something' }],
        ['option 1', { to: addSeconds(baseline, 1), __fixedDateRange: 'fixedDateRange', titleKey: 'something' }],
      ),
    ).toBeFalsy();
  });
  test('Fixed ranges with same dates are equal', () => {
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { to: baseline, __fixedDateRange: 'fixedDateRange', titleKey: 'something' }],
        ['option 1', { to: baseline, __fixedDateRange: 'fixedDateRange', titleKey: 'something else' }],
      ),
    ).toBeTruthy();
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { from: baseline, __fixedDateRange: 'fixedDateRange', titleKey: 'something' }],
        ['option 1', { from: baseline, __fixedDateRange: 'fixedDateRange', titleKey: 'something else' }],
      ),
    ).toBeTruthy();
    expect(
      dateFilterOptionsAreEqual(
        [
          'option 1',
          { from: baseline, to: addDays(baseline, 1), __fixedDateRange: 'fixedDateRange', titleKey: 'something' },
        ],
        [
          'option 1',
          { from: baseline, to: addDays(baseline, 1), __fixedDateRange: 'fixedDateRange', titleKey: 'something else' },
        ],
      ),
    ).toBeTruthy();
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { __fixedDateRange: 'fixedDateRange', titleKey: 'something' }],
        ['option 1', { __fixedDateRange: 'fixedDateRange', titleKey: 'something' }],
      ),
    ).toBeTruthy();
  });

  test('Exists filters with different settings are not equal', () => {
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { exists: DateExistsCondition.MUST_NOT_EXIST, titleKey: 'something' }],
        ['option 1', { exists: DateExistsCondition.MUST_EXIST, titleKey: 'something' }],
      ),
    ).toBeFalsy();
  });

  test('Exists filters with same settings are equal', () => {
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { exists: DateExistsCondition.MUST_NOT_EXIST, titleKey: 'something' }],
        ['option 1', { exists: DateExistsCondition.MUST_NOT_EXIST, titleKey: 'something else' }],
      ),
    ).toBeTruthy();
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { exists: DateExistsCondition.MUST_EXIST, titleKey: 'something' }],
        ['option 1', { exists: DateExistsCondition.MUST_EXIST, titleKey: 'something else' }],
      ),
    ).toBeTruthy();
  });

  test('Relative filters with same option name are always equal', () => {
    expect(
      dateFilterOptionsAreEqual(
        ['option 1', { to: (date: Date) => '', from: (date: Date) => '', titleKey: 'something' }],
        ['option 1', { to: (date: Date) => '', from: (date: Date) => '', titleKey: 'something else' }],
      ),
    ).toBeTruthy();
  });
});

describe('dateFilterPayloadFromFilters', () => {
  test('Creates a filter property for each filter with a setting, named after the filterParameterName', () => {
    const payload = dateFilterPayloadFromFilters([
      { filterPayloadParameter: 'filter1', options: [], labelKey: '' },
      {
        filterPayloadParameter: 'filter2',
        options: [],
        labelKey: '',
        currentSetting: ['option 1', { exists: DateExistsCondition.MUST_EXIST, titleKey: '' }],
      },
      { filterPayloadParameter: 'filter3', options: [], labelKey: '' },
      {
        filterPayloadParameter: 'filter4',
        options: [],
        labelKey: '',
        currentSetting: ['option 1', { exists: DateExistsCondition.MUST_EXIST, titleKey: '' }],
      },
    ]);
    expect(payload).toStrictEqual({
      filter2: expect.anything(),
      filter4: expect.anything(),
    });
  });

  test('Creates an empty object from an empty list', () => {
    expect(dateFilterPayloadFromFilters([])).toStrictEqual({});
  });

  test('Exists filters copy the condition', () => {
    const payload = dateFilterPayloadFromFilters([
      {
        filterPayloadParameter: 'filter1',
        options: [],
        labelKey: '',
        currentSetting: ['option 1', { exists: DateExistsCondition.MUST_EXIST, titleKey: '' }],
      },
      {
        filterPayloadParameter: 'filter2',
        options: [],
        labelKey: '',
        currentSetting: ['option 1', { exists: DateExistsCondition.MUST_NOT_EXIST, titleKey: '' }],
      },
    ]);
    expect(payload).toStrictEqual({
      filter1: { exists: DateExistsCondition.MUST_EXIST },
      filter2: { exists: DateExistsCondition.MUST_NOT_EXIST },
    });
  });
  test('Fixed date ranges copy the to and from dates with a MUST_EXIST condition', () => {
    const payload = dateFilterPayloadFromFilters([
      {
        filterPayloadParameter: 'filter1',
        options: [],
        labelKey: '',
        currentSetting: [
          'option 1',
          {
            from: baseline,
            to: addDays(baseline, 2),
            __fixedDateRange: 'fixedDateRange',
            titleKey: '',
          },
        ],
      },
      {
        filterPayloadParameter: 'filter2',
        options: [],
        labelKey: '',
        currentSetting: [
          'option 1',
          {
            from: baseline,
            __fixedDateRange: 'fixedDateRange',
            titleKey: '',
          },
        ],
      },
      {
        filterPayloadParameter: 'filter3',
        options: [],
        labelKey: '',
        currentSetting: [
          'option 1',
          {
            to: addDays(baseline, 2),
            __fixedDateRange: 'fixedDateRange',
            titleKey: '',
          },
        ],
      },
    ]);
    expect(payload).toStrictEqual({
      filter1: {
        exists: DateExistsCondition.MUST_EXIST,
        from: baseline.toISOString(),
        to: addDays(baseline, 2).toISOString(),
      },
      filter2: { exists: DateExistsCondition.MUST_EXIST, from: baseline.toISOString(), to: undefined },
      filter3: { exists: DateExistsCondition.MUST_EXIST, from: undefined, to: addDays(baseline, 2).toISOString() },
    });
  });
  test('Relative date ranges evaluate the to and from dates with a MUST_EXIST condition', () => {
    const payload = dateFilterPayloadFromFilters(
      [
        {
          filterPayloadParameter: 'filter1',
          options: [],
          labelKey: '',
          currentSetting: [
            'option 1',
            {
              from: ref => ref,
              to: ref => addDays(ref, 2),
              titleKey: '',
            },
          ],
        },
        {
          filterPayloadParameter: 'filter2',
          options: [],
          labelKey: '',
          currentSetting: [
            'option 1',
            {
              from: ref => subDays(ref, 2),
              to: ref => ref,
              titleKey: '',
            },
          ],
        },
      ],
      baseline,
    );
    expect(payload).toStrictEqual({
      filter1: {
        exists: DateExistsCondition.MUST_EXIST,
        from: baseline.toISOString(),
        to: addDays(baseline, 2).toISOString(),
      },
      filter2: {
        exists: DateExistsCondition.MUST_EXIST,
        from: subDays(baseline, 2).toISOString(),
        to: baseline.toISOString(),
      },
    });
  });
});
