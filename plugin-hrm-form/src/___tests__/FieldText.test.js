jest.mock('../Styles/HrmStyles', () => {
    return {
      StyledInput: 'StyledInput',
      StyledLabel: 'StyledLabel',
      ErrorText: 'ErrorText',
      TextField: 'TextField'
    };
  });
  import React from 'react';
  import FieldText from '../components/FieldText';
  import { ValidationType } from '../states/ContactFormStateFactory';
  import renderer from 'react-test-renderer';
  
  //TODO: Improve assertion for all tests below
  test('render basic FieldText', () => {
    const firstName = {
      value: '',
      touched: false,
      error: null,
      validation: null
    };
    const handleBlur = jest.fn();
    const handleChange = jest.fn();
    const handleFocus = jest.fn();
    const taskId = '';

    const component = renderer.create(
      <FieldText
        label="First name"
        parents={['callerInformation', 'name']}
        name="firstName"
        field={firstName}
        taskId={taskId}
        handleBlur={handleBlur}
        handleChange={handleChange}
        handleFocus={handleFocus}
      />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  
  test('render required FieldText', () => {
    const firstName = {
      value: '',
      touched: false,
      error: null,
      validation: [ ValidationType.REQUIRED ]
    };
    const handleBlur = jest.fn();
    const handleChange = jest.fn();
    const handleFocus = jest.fn();
    const taskId = '';

    const component = renderer.create(
      <FieldText
        label="First name"
        parents={['callerInformation', 'name']}
        name="firstName"
        field={firstName}
        taskId={taskId}
        handleBlur={handleBlur}
        handleChange={handleChange}
        handleFocus={handleFocus}
      />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  
  
  test('render FieldText with errors', () => {
    const firstName = {
      value: '',
      touched: true,
      error: 'This field is required',
      validation: [ ValidationType.REQUIRED ]
    };
    const handleBlur = jest.fn();
    const handleChange = jest.fn();
    const handleFocus = jest.fn();
    const taskId = '';

    const component = renderer.create(
      <FieldText
        label="First name"
        parents={['callerInformation', 'name']}
        name="firstName"
        field={firstName}
        taskId={taskId}
        handleBlur={handleBlur}
        handleChange={handleChange}
        handleFocus={handleFocus}
      />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
  