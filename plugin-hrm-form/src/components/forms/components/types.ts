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

import type { RegisterOptions } from 'react-hook-form';
import type { DependentOptions, SelectOption } from 'hrm-form-definitions';
import React from 'react';

type HTMLElementRef = {
  current: HTMLElement | null;
};

export type FormInputBaseProps = {
  inputId: string;
  label: string;
  registerOptions: RegisterOptions;
  updateCallback: () => void;
  initialValue: React.HTMLAttributes<HTMLElement>['defaultValue'] | React.HTMLAttributes<HTMLElement>['defaultChecked'];
  htmlElRef: HTMLElementRef | null;
  isEnabled: boolean;
};

export type FormSelectProps = FormInputBaseProps & { selectOptions: SelectOption[] };

export type DependentFormSelectProps = FormInputBaseProps & {
  dependentOptions: DependentOptions;
  dependsOn: string;
  defaultOption: SelectOption;
};
