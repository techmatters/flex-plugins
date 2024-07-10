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

import { FormDefinition, FormInputType } from 'hrm-form-definitions';

import type { CounselorsList } from '../../../states/configuration/types';

export const createSearchFormDefinition = ({ counselorsList }: { counselorsList: CounselorsList }): FormDefinition => {
  const counsellorOptions = [
    { label: '', value: '' },
    ...counselorsList?.map(c => ({ label: c.fullName, value: c.sid })),
  ];

  return [
    {
      name: 'searchInput',
      label: '',
      type: FormInputType.Input,
      maxLength: { value: 500, message: '500 characters max.' },
    },
    {
      name: 'counselor',
      type: FormInputType.Select,
      label: 'Counselor',
      options: counsellorOptions,
    },
    {
      name: 'dateFrom',
      type: FormInputType.DateInput,
      label: 'Date From',
      initializeWithCurrent: false,
    },
    {
      name: 'dateTo',
      type: FormInputType.DateInput,
      label: 'Date To',
      initializeWithCurrent: false,
    },
  ];
};
