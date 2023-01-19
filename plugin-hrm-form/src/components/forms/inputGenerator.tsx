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
