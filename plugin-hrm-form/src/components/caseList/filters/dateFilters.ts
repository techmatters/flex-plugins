import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';

type RelativeDateRange = {
  titleKey: string;
  titleParameters?: Record<string, string | number>;
  from: (now: Date) => Date;
  to: (now: Date) => Date;
};

type FixedDateRange = {
  __fixedDateRange: 'fixedDateRange';
  titleKey: string;
  titleParameters?: Record<string, string | number>;
  from?: Date;
  to?: Date;
};

export enum DateExistsCondition {
  MUST_EXIST = 'MUST_EXIST',
  MUST_NOT_EXIST = 'MUST_NOT_EXIST',
}

type ExistsDateFilter = {
  titleKey: string;
  titleParameters?: Record<string, string | number>;
  exists: DateExistsCondition;
};

type Divider = { __divider: 'divider' };

type DateFilterSetting = RelativeDateRange | FixedDateRange | ExistsDateFilter;

export type DateFilterOption = [string, DateFilterSetting];

export type DateFilterOptions = (DateFilterOption | Divider)[];

export type DateFilter = {
  labelKey: string;
  filterPayloadParameter: string;
  currentSetting?: DateFilterOption;
  options: DateFilterOptions;
};

const today = (): RelativeDateRange => ({
  titleKey: 'CaseList-Filters-DateFilterOptions-Today',
  from: referenceDate => startOfDay(referenceDate),
  to: referenceDate => endOfDay(referenceDate),
});

const yesterday = (): RelativeDateRange => ({
  titleKey: 'CaseList-Filters-DateFilterOptions-Yesterday',
  from: referenceDate => startOfDay(subDays(referenceDate, 1)),
  to: referenceDate => endOfDay(subDays(referenceDate, 1)),
});

const pastXDays = (days: number): RelativeDateRange => ({
  titleKey: 'CaseList-Filters-DateFilterOptions-PastXDays',
  titleParameters: { days },
  from: referenceDate => startOfDay(subDays(referenceDate, days)),
  to: referenceDate => endOfDay(referenceDate),
});

const tomorrow = (): RelativeDateRange => ({
  titleKey: 'CaseList-Filters-DateFilterOptions-Tomorrow',
  from: referenceDate => startOfDay(addDays(referenceDate, 1)),
  to: referenceDate => endOfDay(addDays(referenceDate, 1)),
});

const nextXDays = (days: number): RelativeDateRange => ({
  titleKey: 'CaseList-Filters-DateFilterOptions-NextXDays',
  titleParameters: { days },
  from: referenceDate => startOfDay(referenceDate),
  to: referenceDate => endOfDay(addDays(referenceDate, days)),
});

const withoutDate = (): ExistsDateFilter => ({
  titleKey: 'CaseList-Filters-DateFilterOptions-WithoutDate',
  exists: DateExistsCondition.MUST_NOT_EXIST,
});

const customRange = (): FixedDateRange => ({
  titleKey: 'CaseList-Filters-DateFilterOptions-CustomRange',
  __fixedDateRange: 'fixedDateRange',
});

const divider = (): Divider => ({ __divider: 'divider' });

export const isDivider = (item: any): item is Divider => (<Divider>item)?.__divider === 'divider';

export const isFixedDateRange = (item: any): item is FixedDateRange =>
  (<FixedDateRange>item)?.__fixedDateRange === 'fixedDateRange';

const isExistsDateFilter = (item: any): item is ExistsDateFilter => Boolean((<ExistsDateFilter>item)?.exists);

const isRelativeDateRange = (item: any): item is RelativeDateRange => {
  const rdr = <RelativeDateRange>item;
  return typeof rdr.from === 'function' && typeof rdr.to === 'function';
};

export const standardCaseListDateFilterOptions = (): DateFilterOptions => [
  ['TODAY', today()],
  ['YESTERDAY', yesterday()],
  ['PAST_7_DAYS', pastXDays(7)],
  ['PAST_30_DAYS', pastXDays(30)],
  divider(),
  ['CUSTOM_RANGE', customRange()],
];

export const followUpDateFilterOptions = (): DateFilterOptions => [
  ['TODAY', today()],
  ['YESTERDAY', yesterday()],
  ['PAST_7_DAYS', pastXDays(7)],
  ['PAST_30_DAYS', pastXDays(30)],
  divider(),
  ['TOMORROW', tomorrow()],
  ['NEXT_7_DAYS', nextXDays(7)],
  ['NEXT_30_DAYS', nextXDays(30)],
  divider(),
  ['WITHOUT_DATE', withoutDate()],
  divider(),
  ['CUSTOM_RANGE', customRange()],
];

/**
 * Creates the date filters sub section of the search endpoint POST payload from a list of DateFilter objects
 * @param filters - the input date filters used to build the payload
 * @param referenceDate - optional date to specify 'now' as the reference point for calculating relative date ranges. Current time is used if not specified. Primarily for testing
 */
export const dateFilterPayloadFromFilters = (filters: DateFilter[], referenceDate = null) => {
  const entries = filters
    .filter(f => f.currentSetting)
    .map(ft => {
      let filterPayload: { from?: string; to?: string; exists: DateExistsCondition };
      const [, filter] = ft.currentSetting;
      if (isFixedDateRange(filter)) {
        filterPayload = {
          from: filter.from?.toISOString(),
          to: filter.to?.toISOString(),
          exists: DateExistsCondition.MUST_EXIST,
        };
      } else if (isExistsDateFilter(filter)) {
        filterPayload = {
          exists: filter.exists,
        };
      } else {
        // relative range from a preset
        const now = referenceDate ?? new Date();
        filterPayload = {
          from: filter.from(now).toISOString(),
          to: filter.to(now).toISOString(),
          exists: DateExistsCondition.MUST_EXIST,
        };
      }
      return [ft.filterPayloadParameter, filterPayload];
    });
  return Object.fromEntries(entries);
};
