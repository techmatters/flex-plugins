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

import { buildFetchDefinition } from './loadDefinition';
import { FormInputType, FormItemDefinition } from './types';

export type PreEngagementFormItem = FormItemDefinition & {
  type:
    | FormInputType.Input
    | FormInputType.Select
    | FormInputType.DependentSelect
    | FormInputType.Checkbox;
};

export type PreEngagementForm = {
  description?: string;
  submitLabel?: string;
  fields?: PreEngagementFormItem[];
};

export const loadWebchatDefinition = async (
  baseUrl: string,
): Promise<{ preEngagementForm: PreEngagementForm }> => {
  const { fetchDefinition } = buildFetchDefinition(baseUrl);

  const preEngagementForm = await fetchDefinition<PreEngagementForm>(
    'webchat/PreEngagementForm.json',
    {},
  );

  return { preEngagementForm };
};
