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
import { CustomHandlers } from '../common/forms/formGenerators';
import { generateCustomContactFormItem } from './components/customContactComponent';
import FormTextArea from './components/FormTextArea/FormTextArea';
import { TaskSID } from '../../types/twilio';
import FormSelect from './components/FormSelect/FormSelect';
import DependentFormSelect from './components/FormSelect/DependentFormSelect';
import FormCheckbox from './components/FormCheckbox/FormCheckbox';
import SearchInput from './components/SearchInput/SearchInput';
import NumericInput from './components/FormInput/NumericInput';
import Email from './components/FormInput/Email';
import RadioInput from './components/RadioInput/RadioInput';
import ListboxMultiselect from './components/ListboxMultiselect/ListboxMultiselect';
import MixedCheckbox from './components/MixedCheckbox/MixedCheckbox';
import DateInput from './components/DateInput/DateInput';
import TimeInput from './components/DateInput/TimeInput';
import FileUpload from './components/FileUpload/FileUpload';
import { Column } from '../../styles/layout';
import { FormInputDescription } from './components/FormInputDescription/FormInputDescription';

const getRegisterOptions = (formItemDefinition: FormItemDefinition): RegisterOptions =>
  pick(formItemDefinition, ['max', 'maxLength', 'min', 'minLength', 'pattern', 'required', 'validate']);

export type CreateInputParams = {
  formItemDefinition: FormItemDefinition;
  parentsPath: string;
  updateCallback: FormInputBaseProps['updateCallback'];
  isItemEnabled?: (item: FormItemDefinition) => boolean;
  initialValue: FormInputBaseProps['initialValue'];
  htmlElRef?: FormInputBaseProps['htmlElRef'];
  customHandlers?: CustomHandlers;
  context?: {
    taskSid?: TaskSID;
    contactId?: string;
  };
};

const createFormInput = ({
  formItemDefinition,
  parentsPath,
  updateCallback,
  isItemEnabled = () => true,
  initialValue,
  customHandlers,
  htmlElRef = null,
  context = {},
}: CreateInputParams): JSX.Element => {
  const isEnabled = isItemEnabled(formItemDefinition);
  const inputId = [parentsPath, formItemDefinition.name].filter(Boolean).join('.');
  const registerOptions = getRegisterOptions(formItemDefinition);

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
    case FormInputType.Textarea: {
      return (
        <FormTextArea
          key={inputId}
          inputId={inputId}
          initialValue={initialValue}
          updateCallback={updateCallback}
          label={formItemDefinition.label}
          rows={formItemDefinition.rows}
          width={formItemDefinition.width}
          additionalActionDefinitions={formItemDefinition.additionalActions ?? []}
          additionalActionContext={context}
          registerOptions={registerOptions}
          isEnabled={isEnabled}
          htmlElRef={htmlElRef}
        />
      );
    }
    case FormInputType.Select: {
      return (
        <FormSelect
          key={inputId}
          inputId={inputId}
          initialValue={initialValue}
          updateCallback={updateCallback}
          label={formItemDefinition.label}
          registerOptions={registerOptions}
          isEnabled={isEnabled}
          htmlElRef={htmlElRef}
          selectOptions={formItemDefinition.options}
        />
      );
    }
    case FormInputType.DependentSelect: {
      return (
        <DependentFormSelect
          key={inputId}
          inputId={inputId}
          initialValue={initialValue}
          updateCallback={updateCallback}
          label={formItemDefinition.label}
          registerOptions={registerOptions}
          isEnabled={isEnabled}
          htmlElRef={htmlElRef}
          dependsOn={formItemDefinition.dependsOn}
          dependentOptions={formItemDefinition.options}
          defaultOption={formItemDefinition.defaultOption}
        />
      );
    }
    case FormInputType.CopyTo:
    case FormInputType.Checkbox: {
      return (
        <FormCheckbox
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
    case FormInputType.CustomContactComponent: {
      return generateCustomContactFormItem(formItemDefinition, inputId, context);
    }
    case FormInputType.SearchInput: {
      return (
        <SearchInput
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
    case FormInputType.NumericInput: {
      return (
        <NumericInput
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
    case FormInputType.Email: {
      return (
        <Email
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
    case FormInputType.RadioInput: {
      return (
        <RadioInput
          key={inputId}
          inputId={inputId}
          initialValue={initialValue}
          updateCallback={updateCallback}
          label={formItemDefinition.label}
          registerOptions={registerOptions}
          isEnabled={isEnabled}
          htmlElRef={htmlElRef}
          options={formItemDefinition.options}
          defaultOption={formItemDefinition.defaultOption}
        />
      );
    }
    case FormInputType.ListboxMultiselect: {
      return (
        <ListboxMultiselect
          key={inputId}
          inputId={inputId}
          initialValue={initialValue}
          updateCallback={updateCallback}
          label={formItemDefinition.label}
          registerOptions={registerOptions}
          isEnabled={isEnabled}
          htmlElRef={htmlElRef}
          options={formItemDefinition.options}
          height={formItemDefinition.height}
          width={formItemDefinition.width}
        />
      );
    }
    case FormInputType.MixedCheckbox: {
      return (
        <MixedCheckbox
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
    case FormInputType.DateInput: {
      return (
        <DateInput
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
    case FormInputType.TimeInput: {
      return (
        <TimeInput
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
    case FormInputType.FileUpload: {
      return (
        <FileUpload
          key={inputId}
          inputId={inputId}
          initialValue={initialValue}
          updateCallback={updateCallback}
          label={formItemDefinition.label}
          registerOptions={registerOptions}
          isEnabled={isEnabled}
          htmlElRef={htmlElRef}
          description={formItemDefinition.description}
          customHandlers={customHandlers}
        />
      );
    }
    default:
      return <div>INVALID FORM INPUT: {inputId}</div>;
  }
};

export const createInput = (params: CreateInputParams): JSX.Element => {
  return (
    <Column
      key={`created-input-${params.parentsPath}-${params.formItemDefinition.name}`}
      style={{ marginTop: 8, marginBottom: 8 }}
    >
      {createFormInput(params)}
      <FormInputDescription definition={params.formItemDefinition} />
    </Column>
  );
};
