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
import { ValidationType } from '../states/ContactFormStateFactory';
import renderer from 'react-test-renderer';

test('FieldFirstName renders initially when not required', () => {
  const form = {
    callerInformation: {
      name: {
        firstName: {
          value: '',
          touched: false,
          error: null,
          validation: null
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

test('FieldFirstName renders initially when required', () => {
  const form = {
    callerInformation: {
      name: {
        firstName: {
          value: '',
          touched: false,
          error: null,
          validation: [ ValidationType.REQUIRED ]
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

test('FieldFirstName renders when valid and not required', () => {
  const form = {
    callerInformation: {
      name: {
        firstName: {
          value: 'testValue',
          touched: false,
          error: null,
          validation: null
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

test('FieldFirstName renders when valid and required', () => {
  const form = {
    callerInformation: {
      name: {
        firstName: {
          value: 'testValue',
          touched: false,
          error: null,
          validation: [ ValidationType.REQUIRED ]
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
          value: '',
          touched: true,
          error: 'This field is required',
          validation: [ ValidationType.REQUIRED ]
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
