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
import { PreEngagementDataItem } from '../../../store/definitions';

const generateFormItem = ({
  definition,
  defaultValue,
  handleChange,
  getItem,
  setItemValue,
  showError,
}: {
  definition: PreEngagementFormItem;
  defaultValue?: PreEngagementDataItem['value'];
  handleChange: (payload: { name: string; value: string | boolean }) => void;
  getItem: (inptuName: string) => PreEngagementDataItem;
  setItemValue: (payload: { name: string; value: string | boolean }) => void;
  showError?: boolean;
}) => {
  switch (definition.type) {
    case FormInputType.Input:
    case FormInputType.Email:
      return (
        <InputText
          key={definition.name}
          definition={definition}
          handleChange={handleChange}
          getItem={getItem}
          showError={showError}
          defaultValue={defaultValue}
        />
      );
    case FormInputType.Select:
      return (
        <Select
          key={definition.name}
          definition={definition}
          handleChange={handleChange}
          getItem={getItem}
          showError={showError}
          defaultValue={defaultValue}
        />
      );
    case FormInputType.DependentSelect:
      return (
        <DependentSelect
          key={definition.name}
          definition={definition}
          handleChange={handleChange}
          getItem={getItem}
          setItemValue={setItemValue}
          showError={showError}
          defaultValue={defaultValue}
        />
      );
    case FormInputType.Checkbox:
      return (
        <Checkbox
          key={definition.name}
          definition={definition}
          handleChange={handleChange}
          getItem={getItem}
          showError={showError}
          defaultValue={defaultValue}
        />
      );
    default:
      return <div>Invalid form definition: {JSON.stringify(definition)}</div>;
  }
};

export const getDefaultValue = (def: PreEngagementFormItem) => {
  switch (def.type) {
    case FormInputType.Input:
    case FormInputType.Email:
    case FormInputType.Select:
    case FormInputType.DependentSelect:
      return '';
    case FormInputType.Checkbox:
      return false;
    default:
      return '';
  }
};

export const generateForm = ({
  form,
  handleChange,
  getItem,
  setItemValue,
  showError = () => true,
}: {
  form: PreEngagementForm['fields'];
  handleChange: (payload: { name: string; value: string | boolean }) => void;
  getItem: (inptuName: string) => PreEngagementDataItem;
  setItemValue: (payload: { name: string; value: string | boolean }) => void;
  showError?: (name: string) => boolean;
}) => {
  return (
    form &&
    form.map(definition => {
      const defaultValue = getItem(definition.name).value ?? getDefaultValue(definition);
      return generateFormItem({
        definition,
        handleChange,
        defaultValue,
        getItem,
        setItemValue,
        showError: showError(definition.name),
      });
    })
  );
};
