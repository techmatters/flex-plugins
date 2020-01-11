import { HANDLE_BLUR,
         HANDLE_FOCUS
        } from './ActionTypes';
import { validateBeforeSubmit, 
         validateOnBlur,
         formIsValid } from './ValidationRules';

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

export const handleSubmit = dispatch => (form, handleCompleteTask) => (task) => {
  const newForm = validateBeforeSubmit(form);
  dispatch({
    type: HANDLE_BLUR, // probably need to rename this
    form: newForm,
    taskId: task.taskSid
  });
  if (formIsValid(newForm)) {
    handleCompleteTask(task.taskSid, task);
  } else {
    window.alert("There is a problem with your submission.  Please check the form for errors.");
  }
}