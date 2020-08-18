import { PREPOPULATE_FORM_CHILD, PREPOPULATE_FORM_CALLER } from '../../../states/ActionTypes';
import { Actions } from '../../../states/ContactState';

const gender = 'Girl';
const age = '10-12';
const taskId = 'WT1234';

describe('test action creators', () => {
  test('prepopulateFormChild ', () => {
    expect(Actions.prepopulateFormChild(gender, age, taskId)).toStrictEqual({
      type: PREPOPULATE_FORM_CHILD,
      gender,
      age,
      taskId,
    });
  });

  test('prepopulateFormCaller ', () => {
    expect(Actions.prepopulateFormCaller(gender, age, taskId)).toStrictEqual({
      type: PREPOPULATE_FORM_CALLER,
      gender,
      age,
      taskId,
    });
  });
});
