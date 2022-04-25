import { addDays, addSeconds, subDays } from 'date-fns';

import { DateExistsCondition, dateFilterPayloadFromFilters } from '../../../../components/caseList/filters/dateFilters';

const baseline = new Date(2000, 10, 14);

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
