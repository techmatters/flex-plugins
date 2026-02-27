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

import { FormInputType, PreEngagementFormItem } from 'hrm-form-definitions';

const REQUIRED_FIELD_ERROR = 'RequiredFieldError';
const validateRequired = ({ value, definition }: { value: string | boolean; definition: PreEngagementFormItem }) => {
  if (!definition.required) {
    return null;
  }

  if (typeof definition.required === 'object') {
    if (definition.required.value === value) {
      return null;
    }

    return definition.required.message || REQUIRED_FIELD_ERROR;
  }

  if (value !== undefined && value !== '') {
    return null;
  }

  return REQUIRED_FIELD_ERROR;
};

const EMAIL_PATTERN_ERROR = 'RequiredFieldError';
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const validateEmailPattern = ({
  value,
  definition,
}: {
  value: string | boolean;
  definition: PreEngagementFormItem;
}) => {
  if (definition.type !== FormInputType.Email) {
    return null;
  }

  if (!value) {
    return null;
  }

  const matches = (value as string)?.match(EMAIL_PATTERN);

  if (Boolean(matches?.length)) {
    return null;
  }

  return EMAIL_PATTERN_ERROR;
};

export const validateInput = ({
  value,
  definition,
}: {
  value: string | boolean;
  definition: PreEngagementFormItem;
}) => {
  const validations = [validateRequired, validateEmailPattern];
  for (const validation of validations) {
    const error = validation({ value, definition });
    if (error) {
      return error;
    }
  }

  return null;
};
