import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';

export type DateFilterType = {
  labelKey: string;
  filterPayloadParameter: string;
  currentSetting?: DateFilterOption;
};

export type RelativeDateRange = {
  titleKey: string;
  from: (now: Date) => Date;
  to: (now: Date) => Date;
};

export type FixedDateRange = {
  __fixedDateRange: 'fixedDateRange';
  titleKey: string;
  from?: Date;
  to?: Date;
};

export enum DateExistsCondition {
  MUST_EXIST = 'MUST_EXIST',
  MUST_NOT_EXIST = 'MUST_NOT_EXIST',
}

export type ExistsDateFilter = {
  titleKey: string;
  exists: DateExistsCondition;
};

export type Divider = { __divider: 'divider' };

export type DateFilter = RelativeDateRange | FixedDateRange | ExistsDateFilter;

export type DateFilterOption = [string, DateFilter];

export type DateFilterOptions = (DateFilterOption | Divider)[];

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
  from: referenceDate => startOfDay(subDays(referenceDate, days)),
  to: referenceDate => endOfDay(referenceDate),
});

const tomorrow = (): RelativeDateRange => ({
  titleKey: 'CaseList-Filters-DateFilterOptions-Tomorrow',
  from: referenceDate => startOfDay(addDays(referenceDate, 1)),
  to: referenceDate => endOfDay(addDays(referenceDate, 1)),
});

const nextXDays = (days: number): RelativeDateRange => ({
  titleKey: 'CaseList-Filters-DateFilterOptions-CustomRange',
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
  (<FixedDateRange>item).__fixedDateRange === 'fixedDateRange';

export const isExistsDateFilter = (item: any): item is ExistsDateFilter => Boolean((<ExistsDateFilter>item)?.exists);

export const standardCaseListDateFilterOptions = (): DateFilterOptions => [
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
