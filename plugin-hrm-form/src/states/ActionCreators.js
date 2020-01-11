import { HANDLE_BLUR,
         HANDLE_FOCUS
        } from './ActionTypes';
import { validateOnBlur } from './ValidationRules';

export const handleBlur = dispatch => (form, taskId) => () => {
  console.log("Received blur event");
  dispatch({
    type: HANDLE_BLUR,
    form: validateOnBlur(form),
    taskId
  });
}

export const handleFocus = dispatch => (taskId, parents, name) => {
  console.log(`handleFocus called with taskId = ${taskId}, parents = ${JSON.stringify(parents)}, name = ${name}`);
  dispatch({
    type: HANDLE_FOCUS,
    parents,
    name,
    taskId
  });
}
