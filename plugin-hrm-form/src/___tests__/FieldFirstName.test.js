jest.mock('../Styles/HrmStyles', () => {
  return {
    StyledInput: 'StyledInput',
    StyledLabel: 'StyledLabel',
    ErrorText: 'ErrorText',
    TextField: 'TextField'
  };
});
import React from 'react';
import FieldFirstName from '../components/FieldFirstName';
import renderer from 'react-test-renderer';

test('FieldFirstName renders initially', () => {
  const form = {
    callerInformation: {
      name: {
        firstName: {
          value: '',
          touched: false,
          error: null
        }
      }
    }
  };
  const handleChange = jest.fn();
  const taskId = '';
  const component = renderer.create(
    <FieldFirstName
      form={form}
      handleChange={handleChange}
      taskId={taskId}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('FieldFirstName renders when valid', () => {
  const form = {
    callerInformation: {
      name: {
        firstName: {
          value: 'testValue',
          touched: false,
          error: null
        }
      }
    }
  };
  const handleChange = jest.fn();
  const taskId = '';
  const component = renderer.create(
    <FieldFirstName
      form={form}
      handleChange={handleChange}
      taskId={taskId}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('FieldFirstName renders errors when not valid', () => {
  const form = {
    callerInformation: {
      name: {
        firstName: {
          value: 'testValue',
          touched: true,
          error: 'This field is required'
        }
      }
    }
  };
  const handleChange = jest.fn();
  const taskId = '';
  const component = renderer.create(
    <FieldFirstName
      form={form}
      handleChange={handleChange}
      taskId={taskId}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
