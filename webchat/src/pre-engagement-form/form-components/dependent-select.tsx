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

/* eslint-disable react/require-default-props */
import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { useFormContext, UseControllerProps } from 'react-hook-form';

import { StyledSelect } from './styles';
import { setValue as setValueAction } from '../state';
import FormComponent from './form-component';
import { useLocalization } from '../localization';

type Options = {
  [key: string]: {
    value: any;
    label: string;
  }[];
};

type OwnProps = {
  label: string;
  dependsOn: string;
  options: Options;
};

type Props = OwnProps & UseControllerProps & typeof mapDispatchToProps;

const DependentSelect: React.FC<Props> = ({ name, label, rules, dependsOn, options, setValueOnRedux }) => {
  const { getLabel } = useLocalization();
  const {
    watch,
    setValue,
    formState: { dirtyFields },
  } = useFormContext();
  const currentValue = watch(name);
  const dependsOnValue = watch(dependsOn);
  const prevValueRef = useRef(undefined);

  const isDirty = currentValue || dirtyFields[name];
  const shouldClear = prevValueRef.current && dependsOnValue !== prevValueRef.current;

  useEffect(() => {
    prevValueRef.current = dependsOnValue;
  }, [dependsOnValue]);

  // Resets <select> when dependsOn value changes
  useEffect(() => {
    if (shouldClear) {
      setValue(name, '', { shouldValidate: isDirty }); // isDirty here prevents displaying errors too soon
      setValueOnRedux(name, '');
    }
  }, [name, dependsOnValue, shouldClear, isDirty, setValue, setValueOnRedux]);

  const buildOptions = () =>
    dependsOnValue && options[dependsOnValue]
      ? options[dependsOnValue].map((option) => (
          <option key={option.value} value={option.value}>
            {getLabel(option.label)}
          </option>
        ))
      : [];

  return (
    <FormComponent name={name} label={label} rules={rules}>
      <StyledSelect disabled={!dependsOnValue}>{buildOptions()}</StyledSelect>
    </FormComponent>
  );
};

const mapDispatchToProps = {
  setValueOnRedux: (name: string, value: string) => setValueAction(name, value),
};

export default connect(null, mapDispatchToProps)(DependentSelect);
