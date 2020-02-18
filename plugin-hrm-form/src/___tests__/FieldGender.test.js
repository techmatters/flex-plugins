jest.mock('../Styles/HrmStyles', () => {
  return {
    ErrorText: 'ErrorText',
    StyledLabel: 'StyledLabel',
    StyledMenuItem: 'StyledMenuItem',
    StyledSelect: 'StyledSelect',
    TextField: 'TextField'
  };
});
import React from 'react';
import FieldSelect from '../components/FieldSelect';
import { ValidationType } from '../states/ContactFormStateFactory';
import renderer from 'react-test-renderer';

test('FieldGender renders initially', () => {
  const form = {
    childInformation: {
      gender: {
        value: '',
        touched: false,
        error: null,
        validation: [ ValidationType.REQUIRED ]
      }
    }
  };
  const component = renderer.create(
    <FieldSelect
      handleBlur={jest.fn()}
      handleChange={jest.fn()}
      handleFocus={jest.fn()}
      field={form.childInformation.gender}
      id="ChildInformation_Gender"
      name="gender"
      label="Gender"
      options={['Male', 'Female', 'Other', 'Unknown']}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('FieldGender renders when valid', () => {
  const form = {
    childInformation: {
      gender: {
        value: 'Female',
        touched: false,
        error: null,
        validation: [ ValidationType.REQUIRED ]
      }
    }
  };
  const handleChange = jest.fn();
  const taskId = '';
  const component = renderer.create(
    <FieldSelect
      handleBlur={jest.fn()}
      handleChange={jest.fn()}
      handleFocus={jest.fn()}
      field={form.childInformation.gender}
      id="ChildInformation_Gender"
      name="gender"
      label="Gender"
      options={['Male', 'Female', 'Other', 'Unknown']}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('FieldGender renders errors when not valid', () => {
  const form = {
    childInformation: {
      gender: {
        value: '',
        touched: true,
        error: 'This field is required',
        validation: [ ValidationType.REQUIRED ]
      }
    }
  };
  const handleChange = jest.fn();
  const taskId = '';
  const component = renderer.create(
    <FieldSelect
      handleBlur={jest.fn()}
      handleChange={jest.fn()}
      handleFocus={jest.fn()}
      field={form.childInformation.gender}
      id="ChildInformation_Gender"
      name="gender"
      label="Gender"
      options={['Male', 'Female', 'Other', 'Unknown']}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
