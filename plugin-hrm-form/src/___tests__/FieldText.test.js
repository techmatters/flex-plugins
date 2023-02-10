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
import renderer from 'react-test-renderer';

import './mockStyled';

import FieldText from '../components/FieldText';
import { ValidationType } from '../components/RequiredAsterisk';

// TODO: Improve assertion for all tests below
test('render basic FieldText', () => {
  const firstName = {
    value: '',
    touched: false,
    error: null,
    validation: null,
  };
  const handleBlur = jest.fn();
  const handleChange = jest.fn();
  const handleFocus = jest.fn();
  const taskId = '';

  const component = renderer.create(
    <FieldText
      id="CallerInformation_FirstName"
      label="First name"
      parents={['callerInformation', 'name']}
      name="firstName"
      field={firstName}
      taskId={taskId}
      handleBlur={handleBlur}
      handleChange={handleChange}
      handleFocus={handleFocus}
    />,
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('render required FieldText', () => {
  const firstName = {
    value: '',
    touched: false,
    error: null,
    validation: [ValidationType.REQUIRED],
  };
  const handleBlur = jest.fn();
  const handleChange = jest.fn();
  const handleFocus = jest.fn();
  const taskId = '';

  const component = renderer.create(
    <FieldText
      id="CallerInformation_FirstName"
      label="First name"
      parents={['callerInformation', 'name']}
      name="firstName"
      field={firstName}
      taskId={taskId}
      handleBlur={handleBlur}
      handleChange={handleChange}
      handleFocus={handleFocus}
    />,
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('render FieldText with errors', () => {
  const firstName = {
    value: '',
    touched: true,
    error: 'This field is required',
    validation: [ValidationType.REQUIRED],
  };
  const handleBlur = jest.fn();
  const handleChange = jest.fn();
  const handleFocus = jest.fn();
  const taskId = '';

  const component = renderer.create(
    <FieldText
      id="CallerInformation_FirstName"
      label="First name"
      parents={['callerInformation', 'name']}
      name="firstName"
      field={firstName}
      taskId={taskId}
      handleBlur={handleBlur}
      handleChange={handleChange}
      handleFocus={handleFocus}
    />,
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
