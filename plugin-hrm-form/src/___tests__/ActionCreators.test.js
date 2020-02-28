import {
  formIsValid,
  moreThanThreeCategoriesSelected,
  validateBeforeSubmit,
  validateOnBlur,
} from '../states/ValidationRules';
import { handleBlur, handleCategoryToggle, handleFocus, handleSubmit } from '../states/ActionCreators';
import { HANDLE_BLUR, HANDLE_FOCUS } from '../states/ActionTypes';
import { FieldType } from '../states/ContactFormStateFactory';

jest.mock('../states/ValidationRules', () => {
  return {
    formIsValid: jest.fn(),
    moreThanThreeCategoriesSelected: jest.fn(),
    validateBeforeSubmit: jest.fn(),
    validateOnBlur: jest.fn(x => x),
  };
});

test('deliberate fail', () => {
  expect(true).toBe(false);
});

test('handleBlur sends the right action when called', () => {
  const dispatch = jest.fn(x => x);
  const form = { test: 'test' };
  const taskId = 'WT1234';
  handleBlur(dispatch)(form, taskId)();
  expect(dispatch.mock.calls.length).toBe(1);
  expect(dispatch.mock.calls[0][0]).toStrictEqual({
    type: HANDLE_BLUR,
    form,
    taskId,
  });
});

test('handleFocus sends the right action when called', () => {
  const dispatch = jest.fn(x => x);
  const taskId = 'WT1234';
  handleFocus(dispatch)(taskId, ['callerInformation', 'name'], 'firstName');
  expect(dispatch.mock.calls.length).toBe(1);
  expect(dispatch.mock.calls[0][0]).toStrictEqual({
    type: HANDLE_FOCUS,
    parents: ['callerInformation', 'name'],
    name: 'firstName',
    taskId,
  });
});

describe('handleSubmit', () => {
  test('blocks submit when form is invalid', () => {
    const dispatch = jest.fn(x => x);
    const handleCompleteTask = jest.fn();
    window.alert = jest.fn();
    const form = {
      test: 'pretend an error is present',
    };
    const task = {
      taskSid: 'WT1234',
    };
    validateBeforeSubmit.mockReturnValueOnce(form);
    formIsValid.mockReturnValueOnce(false);
    handleSubmit(dispatch)(form, handleCompleteTask)(task);
    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0][0]).toStrictEqual({
      type: HANDLE_BLUR,
      form,
      taskId: task.taskSid,
    });
    expect(handleCompleteTask.mock.calls.length).toBe(0);
    expect(window.alert.mock.calls.length).toBe(1);
  });

  test('submits when form is valid', () => {
    const dispatch = jest.fn(x => x);
    const handleCompleteTask = jest.fn();
    window.alert = jest.fn();
    const form = {
      test: 'pretend an error is not present',
    };
    const task = {
      taskSid: 'WT1234',
    };
    validateBeforeSubmit.mockReturnValueOnce(form);
    formIsValid.mockReturnValueOnce(true);
    handleSubmit(dispatch)(form, handleCompleteTask)(task);
    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0][0]).toStrictEqual({
      type: HANDLE_BLUR,
      form,
      taskId: task.taskSid,
    });
    expect(handleCompleteTask.mock.calls.length).toBe(1);
    expect(handleCompleteTask.mock.calls[0][0]).toStrictEqual(task.taskSid);
    expect(handleCompleteTask.mock.calls[0][1]).toStrictEqual(task);
    expect(window.alert.mock.calls.length).toBe(0);
  });
});

describe('handleCategoryToggle', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('alerts on too many categories', () => {
    const form = {
      caseInformation: {
        type: FieldType.TAB,
        categories: {
          type: FieldType.CHECKBOX_FIELD,
          validation: null,
          category1: {
            type: FieldType.INTERMEDIATE,
            sub1: {
              type: FieldType.CHECKBOX,
              value: true,
            },
            sub2: {
              type: FieldType.CHECKBOX,
              value: true,
            },
          },
          category2: {
            type: FieldType.INTERMEDIATE,
            sub1: {
              type: FieldType.CHECKBOX,
              value: true,
            },
            sub2: {
              type: FieldType.CHECKBOX,
              value: false,
            },
          },
        },
      },
    };
    const handleChange = jest.fn();
    const taskId = 'WT1234';
    moreThanThreeCategoriesSelected.mockReturnValueOnce(true);
    window.alert = jest.fn();
    handleCategoryToggle(form, handleChange)(taskId, 'category2', 'sub2', true);
    expect(moreThanThreeCategoriesSelected.mock.calls.length).toBe(1);
    expect(moreThanThreeCategoriesSelected.mock.calls[0][0]).toStrictEqual({
      type: FieldType.CHECKBOX_FIELD,
      validation: null,
      category1: {
        type: FieldType.INTERMEDIATE,
        sub1: {
          type: FieldType.CHECKBOX,
          value: true,
        },
        sub2: {
          type: FieldType.CHECKBOX,
          value: true,
        },
      },
      category2: {
        type: FieldType.INTERMEDIATE,
        sub1: {
          type: FieldType.CHECKBOX,
          value: true,
        },
        sub2: {
          type: FieldType.CHECKBOX,
          value: true,
        },
      },
    });
    expect(window.alert.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls.length).toBe(0);
  });

  test('saves data when not too many categories', () => {
    const form = {
      caseInformation: {
        type: FieldType.TAB,
        categories: {
          type: FieldType.CHECKBOX_FIELD,
          validation: null,
          category1: {
            type: FieldType.INTERMEDIATE,
            sub1: {
              type: FieldType.CHECKBOX,
              value: true,
            },
            sub2: {
              type: FieldType.CHECKBOX,
              value: true,
            },
          },
          category2: {
            type: FieldType.INTERMEDIATE,
            sub1: {
              type: FieldType.CHECKBOX,
              value: false,
            },
            sub2: {
              type: FieldType.CHECKBOX,
              value: false,
            },
          },
        },
      },
    };
    const handleChange = jest.fn();
    const taskId = 'WT1234';
    moreThanThreeCategoriesSelected.mockReturnValueOnce(false);
    window.alert = jest.fn();
    handleCategoryToggle(form, handleChange)(taskId, 'category2', 'sub2', true);
    expect(moreThanThreeCategoriesSelected.mock.calls.length).toBe(1);
    expect(moreThanThreeCategoriesSelected.mock.calls[0][0]).toStrictEqual({
      type: FieldType.CHECKBOX_FIELD,
      validation: null,
      category1: {
        type: FieldType.INTERMEDIATE,
        sub1: {
          type: FieldType.CHECKBOX,
          value: true,
        },
        sub2: {
          type: FieldType.CHECKBOX,
          value: true,
        },
      },
      category2: {
        type: FieldType.INTERMEDIATE,
        sub1: {
          type: FieldType.CHECKBOX,
          value: false,
        },
        sub2: {
          type: FieldType.CHECKBOX,
          value: true,
        },
      },
    });
    expect(window.alert.mock.calls.length).toBe(0);
    expect(handleChange.mock.calls.length).toBe(1);
    expect(handleChange.mock.calls[0][0]).toBe(taskId);
    expect(handleChange.mock.calls[0][1]).toStrictEqual(['caseInformation', 'categories', 'category2']);
    expect(handleChange.mock.calls[0][2]).toBe('sub2');
    expect(handleChange.mock.calls[0][3]).toBe(true);
  });
});
