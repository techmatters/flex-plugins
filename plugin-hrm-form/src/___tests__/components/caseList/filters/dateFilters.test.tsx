import { addDays, subDays } from 'date-fns';

import { DateExistsCondition, dateFilterPayloadFromFilters } from '../../../../components/caseList/filters/dateFilters';

const baseline = new Date(2000, 10, 14);

describe('dateFilterPayloadFromFilters', () => {
  test('Creates a filter property for each filter provided in the map', () => {
    const payload = dateFilterPayloadFromFilters({
      filter2: {
        option: 'Filter 2',
        exists: DateExistsCondition.MUST_NOT_EXIST,
      },
      filter4: {
        option: 'Filter 4',
        exists: DateExistsCondition.MUST_NOT_EXIST,
      },
    });
    expect(payload).toStrictEqual({
      filter2: expect.anything(),
      filter4: expect.anything(),
    });
  });

  test('Creates an empty object from an empty map', () => {
    expect(dateFilterPayloadFromFilters({})).toStrictEqual({});
  });

  test('Exists filters copy the condition', () => {
    const payload = dateFilterPayloadFromFilters({
      filter2: {
        option: 'Filter 2',
        exists: DateExistsCondition.MUST_NOT_EXIST,
      },
      filter4: {
        option: 'Filter 4',
        exists: DateExistsCondition.MUST_EXIST,
      },
    });
    expect(payload).toStrictEqual({
      filter2: { exists: DateExistsCondition.MUST_NOT_EXIST },
      filter4: { exists: DateExistsCondition.MUST_EXIST },
    });
  });
  test('Date ranges copy the to and from dates with a MUST_EXIST condition', () => {
    const payload = dateFilterPayloadFromFilters({
      filter1: {
        from: baseline,
        to: addDays(baseline, 2),
        option: 'option 1',
      },
      filter2: {
        from: baseline,
        option: 'option 2',
      },
      filter3: { to: addDays(baseline, 2), option: 'option 2' },
    });
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
});
