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

import { useRef } from 'react';
import { FieldError, useController, UseControllerOptions, useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { localizeKey } from '../../../localization/localizeKey';
import { selectCurrentTranslations } from '../../../store/config.reducer';

const getErrorMessage = (error: any | FieldError | undefined, currentLocale: (key: string) => string) => {
  if (error === undefined) {
    return '';
  }

  if (error.type === 'required') {
    return error.message || currentLocale('FieldValidationRequiredField');
  }

  if (error.type === 'pattern') {
    /**
     * TODO: ideally there should be a a more generic error string like
     * "FieldValidationInvalidPattern". Right now, Email Validation is the only
     * validation we're using besides Required Fields, so we're fine with
     * falling back to "FieldValidationInvalidEmail".
     */
    return error.message || currentLocale('FieldValidationInvalidEmail');
  }

  return error.message || '';
};
//
// eslint-disable-next-line
export const useFormController = ({
  name,
  rules,
  defaultValue,
}: {
  name: string;
  rules: UseControllerOptions['rules'];
  defaultValue?: string | boolean;
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { field, meta } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  const isRequired = Boolean(rules?.required);

  const translations = useSelector(selectCurrentTranslations);
  const currentLocale = localizeKey(translations);

  const error = Boolean(errors[name]);
  const errorMessage = getErrorMessage(errors[name], currentLocale);

  return {
    field,
    meta,
    isRequired,
    error,
    errorMessage,
  };
};
