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
import FieldGender from '../components/FieldGender';
import renderer from 'react-test-renderer';

test('FieldGender renders initially', () => {
  const form = {
    childInformation: {
      gender: {
        value: '',
        touched: false,
        error: null
      }
    }
  };
  const handleChange = jest.fn();
  const taskId = '';
  const component = renderer.create(
    <FieldGender
      form={form}
      handleChange={handleChange}
      taskId={taskId}
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
        error: null
      }
    }
  };
  const handleChange = jest.fn();
  const taskId = '';
  const component = renderer.create(
    <FieldGender
      form={form}
      handleChange={handleChange}
      taskId={taskId}
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
        error: 'This field is required'
      }
    }
  };
  const handleChange = jest.fn();
  const taskId = '';
  const component = renderer.create(
    <FieldGender
      form={form}
      handleChange={handleChange}
      taskId={taskId}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
