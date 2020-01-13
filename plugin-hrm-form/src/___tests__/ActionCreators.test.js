jest.mock('../states/ValidationRules', () => {
  return {
    validateOnBlur: jest.fn(x => x),
    validateBeforeSubmit: jest.fn(),
    formIsValid: jest.fn()
  };
});
import { validateOnBlur, validateBeforeSubmit, formIsValid } from '../states/ValidationRules';
import { handleFocus, handleBlur, handleSubmit } from '../states/ActionCreators';
import { HANDLE_BLUR,
         HANDLE_FOCUS
        } from '../states/ActionTypes';

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
