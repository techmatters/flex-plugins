import React from 'react';
import { RegisterOptions } from 'react-hook-form';
import { pick } from 'lodash';
import { FormInputType, FormItemDefinition } from 'hrm-form-definitions';

import { FormInputProps } from './components/types';
import { FormInput } from './components';
import { getInputType } from '../formGenerators';

type FileUploadCustomHandlers = {
  onFileChange: (event: any) => Promise<string>;
  onDeleteFile: (fileName: string) => Promise<void>;
};

export type CustomHandlers = FileUploadCustomHandlers;

const getregisterOptions = (formItemDefinition: FormItemDefinition): RegisterOptions =>
  pick(formItemDefinition, ['max', 'maxLength', 'min', 'minLength', 'pattern', 'required', 'validate']);

export type CreateInputParams = {
  formItemDefinition: FormItemDefinition;
  parentsPath: string;
  updateCallback: FormInputProps['updateCallback'];
  isItemEnabled: FormInputProps['isItemEnabled'];
  initialValue: FormInputProps['initialValue'];
  htmlElRef: FormInputProps['htmlElRef'];
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
  const inputId = [parentsPath, formItemDefinition.name].filter(Boolean).join('.');
  console.log(`%c >>>>>>>>>>>>>>> createInput being called for ${inputId}`, 'background: #4c00b0; color: #fff');

  const registerOptions = getregisterOptions(formItemDefinition);
  switch (formItemDefinition.type) {
    case FormInputType.Input: {
      return (
        <FormInput
          inputId={inputId}
          initialValue={initialValue}
          updateCallback={updateCallback}
          label={formItemDefinition.label}
          registerOptions={registerOptions}
          isItemEnabled={isItemEnabled}
          htmlElRef={htmlElRef}
        />
      );
    }
    default:
      // return <div>INVALID FORM INPUT: {inputId}</div>;
      return getInputType(parentsPath.split('.'), updateCallback, customHandlers)(formItemDefinition)(
        initialValue,
        htmlElRef,
        !isItemEnabled(),
      );
  }
};
