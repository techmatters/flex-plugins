/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable sonarjs/no-identical-functions */
/* eslint-disable sonarjs/no-collapsible-if */
import cloneDeep from 'lodash/cloneDeep';
import { callTypes } from 'hrm-form-definitions';

import { FieldType, ValidationType, isNotCategory, isNotSubcategory } from './ContactFormStateFactory';
import { getConfig } from '../HrmFormPlugin';

/*
 * Questionable whether we should export this
 * Be careful, this returns true if it's empty
 */
export function isNonDataCallType(callType) {
  return callType !== callTypes.caller && callType !== callTypes.child;
}

function countSelectedCategories(categoryFormSection) {
  let count = 0;
  for (const category of Object.keys(categoryFormSection).filter(key => !isNotCategory(key))) {
    for (const subcategory of Object.keys(categoryFormSection[category]).filter(key => !isNotSubcategory(key))) {
      if (categoryFormSection[category][subcategory].value) {
        count += 1;
      }
    }
  }
  return count;
}

// NOTE: MODIFIES INPUT
function handleCallerOrChildInformationKeys(formToModify, ignoreTouched) {
  const { strings } = getConfig();

  Object.keys(formToModify)
    .filter(key => key !== 'type' && key !== 'validation' && key !== 'error')
    // eslint-disable-next-line sonarjs/cognitive-complexity
    .forEach(key => {
      if (formToModify[key].type === FieldType.INTERMEDIATE) {
        handleCallerOrChildInformationKeys(formToModify[key], ignoreTouched);
      } else if (formToModify[key].validation) {
        if (formToModify[key].validation.includes(ValidationType.REQUIRED)) {
          const field = formToModify[key];
          if (field.type === FieldType.CHECKBOX_FIELD) {
            if ((ignoreTouched || field.touched) && countSelectedCategories(field) === 0) {
              field.error = strings['Error-CategoryRequired'];
              field.touched = true;
            } else {
              field.error = null;
            }
          } else if ((ignoreTouched || field.touched) && !field.value) {
            // explicitly set it to touched so it can't get unset later
            field.touched = true;
            field.error = 'This field is required';
          } else {
            field.error = null;
          }
        }
      }
    });
}

function validateCallerInformation(original, callType, ignoreTouched) {
  if (callType !== callTypes.caller) {
    return original;
  }
  const newForm = cloneDeep(original);
  handleCallerOrChildInformationKeys(newForm, ignoreTouched);
  return newForm;
}

function validateChildInformation(original, callType, ignoreTouched) {
  const newForm = cloneDeep(original);
  handleCallerOrChildInformationKeys(newForm, ignoreTouched);
  return newForm;
}

function validateCaseInformation(original, callType, ignoreTouched) {
  const newForm = cloneDeep(original);
  handleCallerOrChildInformationKeys(newForm, ignoreTouched);
  return newForm;
}

function validate(form, ignoreTouched = false) {
  if (isNonDataCallType(form.callType)) {
    return form;
  }
  let newForm = {};
  newForm = {
    ...form,
    callerInformation: validateCallerInformation(form.callerInformation, form.callType, ignoreTouched),
    childInformation: validateChildInformation(form.childInformation, form.callType, ignoreTouched),
    caseInformation: validateCaseInformation(form.caseInformation, form.callType, ignoreTouched),
  };
  return newForm;
}

export function validateBeforeSubmit(form) {
  if (isNonDataCallType(form.callType)) {
    return form;
  }

  /*
   * we need to also consider whether we care about caller information or just child
   * and if you start with caller type, get invalid, then switch to child type, it's still disabled
   */
  return validate(form, true);
}

/*
 * returns a new version of the form that updates the error messages
 * should this actually check for whether anything has changed?
 * not planning to do that yet, but could add it as an optimization
 */
export function validateOnBlur(form) {
  return validate(form);
}

// walk a form tree looking for non-null error values
export function formIsValid(form) {
  if ('callType' in form) {
    if (isNonDataCallType(form.callType)) {
      return true;
    }
  }

  if ('error' in form && form.error !== null) {
    return false;
  }
  for (const key of Object.keys(form)) {
    if (typeof form[key] === 'object' && form[key] !== null && !formIsValid(form[key])) {
      return false;
    }
  }
  return true;
}
