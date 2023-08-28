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
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { UseControllerProps, useFormContext } from 'react-hook-form';

import { StyledSelect } from './styles';
import FormComponent from './form-component';
import { useLocalization } from '../localization';
import { setValue as setValueAction } from '../state';

type Option = {
  value: any;
  label: string;
};

type OwnProps = {
  label: string;
  options: Option[];
  defaultValue?: string;
};

type Props = OwnProps & UseControllerProps & typeof mapDispatchToProps;

const Select: React.FC<Props> = ({ name, label, rules, options, defaultValue, setValueOnRedux }) => {
  const { getLabel } = useLocalization();
  const { watch } = useFormContext();
  const currentvalue = watch(name);

  // Initialize value on redux
  useEffect(() => {
    if (!currentvalue && defaultValue) {
      setValueOnRedux(name, defaultValue);
    }
  }, [name, defaultValue, currentvalue, setValueOnRedux]);

  const buildOptions = () =>
    options.map((option) => (
      <option key={option.value} value={option.value}>
        {getLabel(option.label)}
      </option>
    ));

  return (
    <FormComponent name={name} label={label} rules={rules} defaultValue={defaultValue}>
      <StyledSelect disabled={false}>{buildOptions()}</StyledSelect>
    </FormComponent>
  );
};

const mapDispatchToProps = {
  setValueOnRedux: (name: string, value: string) => setValueAction(name, value),
};

export default connect(null, mapDispatchToProps)(Select);
