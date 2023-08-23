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

import { UseControllerProps } from 'react-hook-form';

type InputText = {
  type: 'input-text';
  label: string;
  name: string;
  placeholder?: string;
} & UseControllerProps['rules'];

type SelectOption = { value: any; label: string };
type Select = {
  type: 'select';
  label: string;
  name: string;
  options: SelectOption[];
  defaultValue?: string;
} & UseControllerProps['rules'];

type DependentSelectOptions = { [key: string]: SelectOption[] };
type DependentSelect = {
  type: 'dependent-select';
  dependsOn: string;
  label: string;
  name: string;
  options: DependentSelectOptions;
} & UseControllerProps['rules'];

type Checkbox = {
  type: 'checkbox';
  label: string;
  name: string;
} & UseControllerProps['rules'];

export type PreEngagementFormItem = InputText | Select | DependentSelect | Checkbox;
export type PreEngagementForm = {
  description: string;
  submitLabel?: string;
  fields: PreEngagementFormItem[];
};
