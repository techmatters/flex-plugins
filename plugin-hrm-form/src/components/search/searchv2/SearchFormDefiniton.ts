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

// Search Input, counselor list, date range
import { FormDefinition, FormInputType, FormItemDefinition } from 'hrm-form-definitions';
import { isFuture, isAfter } from 'date-fns';

import type { CounselorsList } from '../../../states/configuration/types';
import { splitDate } from '../../../utils/helpers';

export const createSearchFormDefinition = ({
  counselorsList,
}: {
  counselorsList: CounselorsList;
  // }): SearchFormDefinitionObject => {
}): FormDefinition => {
  console.log('>>> createSearchFormDefinition start');
  const counsellorOptions = counselorsList
    ? [{ label: '', value: '' }, ...counselorsList.map(c => ({ label: c.fullName, value: c.sid }))]
    : [{ label: '', value: '' }];

  return [
    {
      name: 'searchInput',
      label: '',
      type: FormInputType.SearchInput,
      maxLength: { value: 500, message: '500 characters max.' },
    },
    {
      name: 'counselor',
      type: FormInputType.Select,
      label: 'Counselor Name',
      options: counsellorOptions,
    },
    {
      name: 'dateFrom',
      type: FormInputType.DateInput,
      label: 'Start Date',
      initializeWithCurrent: false,
      validate: date => {
        const [y, m, d] = splitDate(date);
        const inputDate = new Date(y, m - 1, d);

        // Date is lesser than Unix epoch (00:00:00 UTC on 1 January 1970)
        if (inputDate.getTime() < 0) return 'DateCantBeLesserThanEpoch';

        // Date is greater than "today"
        if (isFuture(inputDate)) return 'DateCantBeGreaterThanToday';

        // TODO: Date is greater than DateTo
        // if (isAfter(inputDate, dateTo)) {
        //   return 'InputDateCantBeGreaterThanDateTo';
        // }
        return null;
      },
    },
    {
      name: 'dateTo',
      type: FormInputType.DateInput,
      label: 'End Date',
      initializeWithCurrent: false,
      validate: date => {
        const [y, m, d] = splitDate(date);
        const inputDate = new Date(y, m - 1, d);

        // Date is lesser than Unix epoch (00:00:00 UTC on 1 January 1970)
        if (inputDate.getTime() < 0) return 'DateCantBeLesserThanEpoch';

        // Date is greater than "today"
        if (isFuture(inputDate)) return 'DateCantBeGreaterThanToday';

        return null;
      },
    },
  ];
};
