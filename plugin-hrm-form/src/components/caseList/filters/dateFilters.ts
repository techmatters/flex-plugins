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

import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';

import { DateExistsCondition } from '../../../states/caseList/dateFilters';

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

export const isExistsDateFilter = (item: any): item is ExistsDateFilter => Boolean((<ExistsDateFilter>item)?.exists);

export const dateFilterOptionsInPast = (): DateFilterOptions => [
  ['TODAY', today()],
  ['YESTERDAY', yesterday()],
  ['PAST_7_DAYS', pastXDays(7)],
  ['PAST_30_DAYS', pastXDays(30)],
  divider(),
  ['CUSTOM_RANGE', customRange()],
];

export const dateFilterOptionsInPastAndFuture = (): DateFilterOptions => [
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
