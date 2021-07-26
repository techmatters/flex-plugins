import { createStateItem } from '../components/common/forms/formGenerators';
import { createFormDefinition as createContactlessTaskTabDefinition } from '../components/tabbedForms/ContactlessTaskTabDefinition';

export const ValidationType = {
  REQUIRED: 'REQUIRED', // Will not be applied if in the callerInformation tab and callType is not caller.  Will not be applied when callType is standalone.
};
export const FieldType = {
  CALL_TYPE: 'CALL_TYPE',
  CHECKBOX: 'CHECKBOX',
  CHECKBOX_FIELD: 'CHECKBOX_FIELD',
  INTERMEDIATE: 'INTERMEDIATE',
  SELECT_SINGLE: 'SELECT_SINGLE',
  TAB: 'TAB',
  TEXT_BOX: 'TEXT_BOX',
  TEXT_INPUT: 'TEXT_INPUT',
};

export function isNotCategory(value) {
  const notCategory = ['error', 'touched', 'type', 'validation'];
  return notCategory.includes(value);
}

export function isNotSubcategory(value) {
  const notSubcategory = ['type'];
  return notSubcategory.includes(value);
}
