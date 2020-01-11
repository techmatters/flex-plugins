jest.mock('../states/ValidationRules', () => {
  return {
    validateOnBlur: jest.fn(x => x)
  };
});
import { validateOnBlur } from '../states/ValidationRules';
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
    const taskId = 'WT1234';
    handleSubmit(dispatch)(form, taskId)();
    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0][0]).toStrictEqual({
      type: HANDLE_BLUR,
      form,
      taskId
    });
  });

  test('submits when form is valid', () => {
    const dispatch = jest.fn(x => x);
    const taskId = 'WT1234';
    handleSubmit(dispatch)(form, taskId)();
    expect(dispatch.mock.calls.length).toBe(2);
    expect(dispatch.mock.calls[0][0]).toStrictEqual({
      type: HANDLE_BLUR,
      form,
      taskId // grrrrrrr what about touched???????
    })
  });
})
