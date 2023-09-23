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

import InputText from './input-text';
import Select from './select';
import DependentSelect from './dependent-select';
import Checkbox from './checkbox';
import type { PreEngagementForm, PreEngagementFormItem } from './types';

const generateFormItem = (item: PreEngagementFormItem) => {
  const rules = {
    required: item.required,
    pattern: item.pattern,
    min: item.min,
    max: item.max,
    maxLength: item.maxLength,
    minLength: item.minLength,
    validate: item.validate,
  };

  switch (item.type) {
    case 'input-text':
      return (
        <InputText key={item.name} name={item.name} label={item.label} placeholder={item.placeholder} rules={rules} />
      );
    case 'select':
      return (
        <Select
          key={item.name}
          name={item.name}
          label={item.label}
          rules={rules}
          options={item.options}
          defaultValue={item.defaultValue}
        />
      );
    case 'dependent-select':
      return (
        <DependentSelect
          key={item.name}
          name={item.name}
          label={item.label}
          rules={rules}
          dependsOn={item.dependsOn}
          options={item.options}
        />
      );
    case 'checkbox':
      return <Checkbox key={item.name} name={item.name} label={item.label} rules={rules} />;
    default:
      return <div>Invalid form item: {item}</div>;
  }
};

export const generateForm = (form: PreEngagementForm['fields']) => form.map((item) => generateFormItem(item));
