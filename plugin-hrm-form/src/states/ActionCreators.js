import { HANDLE_BLUR, HANDLE_FOCUS, SAVE_CONTACT_STATE } from './ActionTypes';
import { formIsValid, moreThanThreeCategoriesSelected, validateBeforeSubmit, validateOnBlur } from './ValidationRules';

export const handleBlur = dispatch => (form, taskId) => () => {
  console.log('Received blur event');
  dispatch({
    type: HANDLE_BLUR,
    form: validateOnBlur(form),
    taskId,
  });
};

export const handleFocus = dispatch => (taskId, parents, name) => {
  console.log(`handleFocus called with taskId = ${taskId}, parents = ${JSON.stringify(parents)}, name = ${name}`);
  dispatch({
    type: HANDLE_FOCUS,
    parents,
    name,
    taskId,
  });
};

export const handleSubmit = dispatch => (form, hrmBaseUrl, workerSid, helpline, handleCompleteTask) => task => {
  const newForm = validateBeforeSubmit(form);
  dispatch({
    type: HANDLE_BLUR, // probably need to rename this
    form: newForm,
    taskId: task.taskSid,
  });
  if (formIsValid(newForm)) {
    dispatch({
      type: SAVE_CONTACT_STATE,
      hrmBaseUrl,
      task,
      abortFunction: () => null,
      workerSid,
      helpline,
    });
    handleCompleteTask(task.taskSid, task);
  } else {
    window.alert('There is a problem with your submission.  Please check the form for errors.');
  }
};

/*
 * This is not technically an ActionCreator.  It's more of a filter and/or validator,
 * but it happens on an event.  Does it belong here?
 * This is also (dangerously?) hardcoding where the category information is.
 */
export const handleCategoryToggle = (form, handleChange) => (taskId, category, subcategory, newValue) => {
  const candidateCategories = {
    ...form.caseInformation.categories,
    [category]: {
      ...form.caseInformation.categories[category],
      [subcategory]: {
        ...form.caseInformation.categories[category][subcategory],
        value: newValue,
      },
    },
  };
  if (moreThanThreeCategoriesSelected(candidateCategories)) {
    window.alert('You cannot select more than three category options');
  } else {
    handleChange(taskId, ['caseInformation', 'categories', category], subcategory, newValue);
  }
};
