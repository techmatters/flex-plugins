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

import React from 'react';
import { SelectOption } from 'hrm-form-definitions';

import { FormOption } from './styles';

const bindCreateSelectOptions = (path: string) => (o: SelectOption, selected: boolean) => (
  <FormOption key={`${path}-${o.label}-${o.value}`} value={o.value} isEmptyValue={o.value === ''} selected={selected}>
    {o.label}
  </FormOption>
);

// eslint-disable-next-line import/no-unused-modules
export const generateSelectOptions = (path: string, options: SelectOption[], currentValue: string): JSX.Element[] => {
  const createSelectOptions = bindCreateSelectOptions(path);
  const optionElements: JSX.Element[] = [];

  // Need to select specifically first matching value, which is why we don't just use .map
  let foundValue = false;
  options.forEach(option => {
    if (!foundValue && option.value === currentValue) {
      foundValue = true;
      optionElements.push(createSelectOptions(option, true));
    } else {
      optionElements.push(createSelectOptions(option, false));
    }
  });
  return optionElements;
};
