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
import { PreEngagementFormItem, PreEngagementForm, FormInputType } from 'hrm-form-definitions';

import InputText from './Input';
import Select from './Select';
import DependentSelect from './DependentSelect';
import Checkbox from './Checkbox';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

const generateFormItem = ({
  definition,
  defaultValue = '',
  handleChange,
}: {
  definition: PreEngagementFormItem;
  defaultValue?: string | boolean;
  handleChange: () => void;
}) => {
  const rules = {
    required: definition.required,
    min: definition.min,
    max: definition.max,
    maxLength: definition.maxLength,
    minLength: definition.minLength,
    validate: definition.validate,
  };

  switch (definition.type) {
    case FormInputType.Input:
      return (
        <InputText
          key={definition.name}
          name={definition.name}
          label={definition.label}
          placeholder={definition.placeholder}
          rules={rules}
          handleChange={handleChange}
        />
      );
    case FormInputType.Email:
      return (
        <InputText
          key={definition.name}
          name={definition.name}
          label={definition.label}
          placeholder={definition.placeholder}
          rules={{
            ...rules,
            pattern: EMAIL_PATTERN,
          }}
          handleChange={handleChange}
        />
      );
    case FormInputType.Select:
      return (
        <Select
          key={definition.name}
          name={definition.name}
          label={definition.label}
          rules={rules}
          options={definition.options}
          defaultValue={defaultValue as string}
          handleChange={handleChange}
        />
      );
    case FormInputType.DependentSelect:
      return (
        <DependentSelect
          key={definition.name}
          name={definition.name}
          label={definition.label}
          rules={rules}
          dependsOn={definition.dependsOn}
          options={definition.options}
          handleChange={handleChange}
        />
      );
    case FormInputType.Checkbox:
      return (
        <Checkbox
          key={definition.name}
          name={definition.name}
          label={definition.label}
          rules={rules}
          handleChange={handleChange}
        />
      );
    default:
      return <div>Invalid form definition: {JSON.stringify(definition)}</div>;
  }
};

const getDefaultValue = (def: PreEngagementFormItem) => {
  switch (def.type) {
    case FormInputType.Input:
    case FormInputType.Email:
    case FormInputType.Select:
    case FormInputType.DependentSelect:
      return '';
    case FormInputType.Checkbox:
      return false;
    default:
      return undefined;
  }
};

export const generateForm = ({
  form,
  handleChange,
}: {
  form: PreEngagementForm['fields'];
  handleChange: () => void;
}) => {
  return (
    form &&
    form.map(definition => generateFormItem({ definition, handleChange, defaultValue: getDefaultValue(definition) }))
  );
};
