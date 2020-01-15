jest.mock('../states/ValidationRules', () => {
  return {
    formIsValid: jest.fn(),
    moreThanThreeCategoriesSelected: jest.fn(),
    validateBeforeSubmit: jest.fn(),
    validateOnBlur: jest.fn(x => x)
  };
});
import { formIsValid,
         moreThanThreeCategoriesSelected,
         validateBeforeSubmit,
         validateOnBlur } from '../states/ValidationRules';
import { handleBlur,
         handleCategoryToggle,
         handleFocus,
         handleSubmit } from '../states/ActionCreators';
import { HANDLE_BLUR,
         HANDLE_FOCUS } from '../states/ActionTypes';

test('handleBlur sends the right action when called', () => {
  const dispatch = jest.fn(x => x);
  const form = { test: 'test' };
  const taskId = 'WT1234';
  handleBlur(dispatch)(form, taskId)();
  expect(dispatch.mock.calls.length).toBe(1);
  expect(dispatch.mock.calls[0][0]).toStrictEqual({
    type: HANDLE_BLUR,
    form,
    taskId
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
    taskId
  });
});


describe('handleSubmit', () => {
  test('blocks submit when form is invalid', () => {
    const dispatch = jest.fn(x => x);
    const handleCompleteTask = jest.fn();
    window.alert = jest.fn();
    const form = {
      test: 'pretend an error is present'
    }
    const task = {
      taskSid: 'WT1234'
    };
    validateBeforeSubmit.mockReturnValueOnce(form);
    formIsValid.mockReturnValueOnce(false);
    handleSubmit(dispatch)(form, handleCompleteTask)(task);
    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0][0]).toStrictEqual({
      type: HANDLE_BLUR,
      form,
      taskId: task.taskSid
    });
    expect(handleCompleteTask.mock.calls.length).toBe(0);
    expect(window.alert.mock.calls.length).toBe(1);
  });

  test('submits when form is valid', () => {
    const dispatch = jest.fn(x => x);
    const handleCompleteTask = jest.fn();
    window.alert = jest.fn();
    const form = {
      test: 'pretend an error is not present'
    }
    const task = {
      taskSid: 'WT1234'
    };
    validateBeforeSubmit.mockReturnValueOnce(form);
    formIsValid.mockReturnValueOnce(true);
    handleSubmit(dispatch)(form, handleCompleteTask)(task);
    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0][0]).toStrictEqual({
      type: HANDLE_BLUR,
      form,
      taskId: task.taskSid
    });
    expect(handleCompleteTask.mock.calls.length).toBe(1);
    expect(handleCompleteTask.mock.calls[0][0]).toStrictEqual(task.taskSid);
    expect(handleCompleteTask.mock.calls[0][1]).toStrictEqual(task);
    expect(window.alert.mock.calls.length).toBe(0);
  });
})

describe('handleCategoryToggle', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('alerts on too many categories', () => {
    const form = {
      caseInformation: {
        categories: {
          category1: {
            sub1: true,
            sub2: true
          },
          category2: {
            sub1: true,
            sub2: false
          }
        }
      }
    };
    const handleCheckbox = jest.fn();
    const taskId = 'WT1234';
    moreThanThreeCategoriesSelected.mockReturnValueOnce(true);
    window.alert = jest.fn();
    handleCategoryToggle(form, handleCheckbox)(taskId, 'category2', 'sub2', true);
    expect(moreThanThreeCategoriesSelected.mock.calls.length).toBe(1);
    expect(moreThanThreeCategoriesSelected.mock.calls[0][0]).toStrictEqual({
      category1: {
        sub1: true,
        sub2: true
      },
      category2: {
        sub1: true,
        sub2: true
      }
    });
    expect(window.alert.mock.calls.length).toBe(1);
    expect(handleCheckbox.mock.calls.length).toBe(0);
  });

  test('saves data when not too many categories', () => {
    const form = {
      caseInformation: {
        categories: {
          category1: {
            sub1: true,
            sub2: true
          },
          category2: {
            sub1: false,
            sub2: false
          }
        }
      }
    };
    const handleCheckbox = jest.fn();
    const taskId = 'WT1234';
    moreThanThreeCategoriesSelected.mockReturnValueOnce(false);
    window.alert = jest.fn();
    handleCategoryToggle(form, handleCheckbox)(taskId, 'category2', 'sub2', true);
    expect(moreThanThreeCategoriesSelected.mock.calls.length).toBe(1);
    expect(moreThanThreeCategoriesSelected.mock.calls[0][0]).toStrictEqual({
      category1: {
        sub1: true,
        sub2: true
      },
      category2: {
        sub1: false,
        sub2: true
      }
    });
    expect(window.alert.mock.calls.length).toBe(0);
    expect(handleCheckbox.mock.calls.length).toBe(1);
    expect(handleCheckbox.mock.calls[0][0]).toBe(taskId);
    expect(handleCheckbox.mock.calls[0][1]).toStrictEqual(['caseInformation', 'categories', 'category2']);
    expect(handleCheckbox.mock.calls[0][2]).toBe('sub2');
    expect(handleCheckbox.mock.calls[0][3]).toBe(true);
  });
});