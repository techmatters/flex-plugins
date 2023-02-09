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
import { RegisterOptions } from 'react-hook-form';
import { pick } from 'lodash';
import { FormInputType, FormItemDefinition } from 'hrm-form-definitions';

import { FormInputBaseProps } from './components/types';
import { FormInput } from './components';
import { getInputType, CustomHandlers } from '../common/forms/formGenerators';

const getregisterOptions = (formItemDefinition: FormItemDefinition): RegisterOptions =>
  pick(formItemDefinition, ['max', 'maxLength', 'min', 'minLength', 'pattern', 'required', 'validate']);

export type CreateInputParams = {
  formItemDefinition: FormItemDefinition;
  parentsPath: string;
  updateCallback: FormInputBaseProps['updateCallback'];
  isItemEnabled?: (item: FormItemDefinition) => boolean;
  initialValue: FormInputBaseProps['initialValue'];
  htmlElRef: FormInputBaseProps['htmlElRef'];
  customHandlers?: CustomHandlers;
};

export const createInput = ({
  formItemDefinition,
  parentsPath,
  updateCallback,
  isItemEnabled,
  initialValue,
  customHandlers,
  htmlElRef,
}: CreateInputParams): JSX.Element => {
  const isEnabled = isItemEnabled(formItemDefinition);
  const inputId = [parentsPath, formItemDefinition.name].filter(Boolean).join('.');
  const registerOptions = getregisterOptions(formItemDefinition);

  // eslint-disable-next-line sonarjs/no-small-switch
  switch (formItemDefinition.type) {
    case FormInputType.Input: {
      return (
        <FormInput
          key={inputId}
          inputId={inputId}
          initialValue={initialValue}
          updateCallback={updateCallback}
          label={formItemDefinition.label}
          registerOptions={registerOptions}
          isEnabled={isEnabled}
          htmlElRef={htmlElRef}
        />
      );
    }
    // Until all the "FormInputType"s are migrated, default to using the old getInputType
    default:
      // return <div>INVALID FORM INPUT: {inputId}</div>;
      return getInputType(parentsPath.split('.').filter(Boolean), updateCallback, customHandlers)(formItemDefinition)(
        initialValue,
        htmlElRef,
        isEnabled,
      );
  }
};
