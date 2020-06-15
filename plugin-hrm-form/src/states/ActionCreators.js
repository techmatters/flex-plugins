import { HANDLE_BLUR, HANDLE_FOCUS, HANDLE_VALIDATE_FORM } from './ActionTypes';
import { moreThanThreeCategoriesSelected, validateBeforeSubmit, validateOnBlur } from './ValidationRules';

export const handleBlur = dispatch => (form, taskId) => () => {
  console.log('Received blur event');
  dispatch({
    type: HANDLE_BLUR,
    form: validateOnBlur(form),
    taskId,
  });
};

export const handleValidateForm = dispatch => (form, taskId) => () => {
  const newForm = validateBeforeSubmit(form);
  dispatch({
    type: HANDLE_VALIDATE_FORM,
    form: validateOnBlur(newForm),
    taskId,
  });

  return newForm;
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
