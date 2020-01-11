jest.mock('../Styles/HrmStyles', () => {
  return {
    StyledInput: 'StyledInput',
    StyledLabel: 'StyledLabel',
    TextField: 'TextField'
  };
});
import React from 'react';
import FieldFirstName from '../components/FieldFirstName';
import renderer from 'react-test-renderer';

test('FieldFirstName renders as planned', () => {
  const theme = jest.fn();
  const form = {
    callerInformation: {
      name: {
        firstName: {
          value: 'testValue',
          touched: true,
          error: null
        }
      }
    }
  };
  const handleChange = jest.fn();
  const taskId = '';
  const component = renderer.create(
    <FieldFirstName
      theme={theme}
      form={form}
      handleChange={handleChange}
      taskId={taskId}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
