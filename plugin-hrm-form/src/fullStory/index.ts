/**
 * Copyright (C) 2021-2025 Technology Matters
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

import * as FullStory from '@fullstory/browser';
import { FieldValues, SubmitErrorHandler } from 'react-hook-form';

/**
 * Recursive function that strips element references out of form validation error objects produced by react form hooks
 * This makes them safe to serialize (DOM elements have circular references) as well as stripping out a lot of irrelevant cruft
 * @param original - the original error
 */
function serializableFormValidationError(original: any) {
  if (typeof original !== 'object') {
    return original;
  }
  const serializableEntries = Object.entries(original)
    .filter(([key]) => key !== 'ref')
    .map(([key, value]) => [key, serializableFormValidationError(value)]);
  return Object.fromEntries(serializableEntries);
}

/**
 * Wrapper for Fullstory.event that catches errors and logs them as warnings
 */
export function recordEvent(eventType: string, payload: any) {
  try {
    FullStory.event(eventType, payload);
  } catch (error) {
    console.warn(`Failed to send ${eventType} event`, error, payload);
  }
}

/**
 * Recursive function that checks the error object(branch) for type and message properties(leaf) and returns an array of objects based on the nested nature of the branch or leaf.
 * @param tabName - the tab or section at which the fields are present
 * @param fieldName - the name of the field (i.e., - firstname, age)
 * @param object - the error object
 */
function getFieldErrorObj(tabName: string, fieldName: string, object: any): any[] {
  if (object.hasOwnProperty('type') && object.hasOwnProperty('message')) {
    return [{ [fieldName]: { tab: tabName, ...object } }];
  } else if (typeof object === 'object') {
    return Object.keys(object).flatMap(child => getFieldErrorObj(tabName, child, object[child]));
  }
  return [];
}
/**
 * Transforms a form error object into single field errors - returns an array of all the field errors at error object for a form
 * @param errorObj - the error object after clean up with serializableFormValidationError
 */
function transformErrorObj(errorObj: any) {
  return Object.keys(errorObj).flatMap(tab => getFieldErrorObj(tab, tab, errorObj[tab]));
}

/**
 * Sends form validation errors to fullstory.com, under the event name 'Form Error'
 * Specvific form error information is sent as a JSON blob in a single property for now because I'm not sure how much fullstory likes dynamic payloads
 * In addition to 'Form Error', several 'Custom Error' events are also sent which are separated into specific field errors. The original error is cleaned up with serializableFormValidationError method and flattened into the errorArr
 * @param origin - A string identifying the form the error originated from
 * @param formError - The error object produced by the form validation (i.e. the first parameter of the error handler)
 */
export function recordFormValidationError(origin: string, formError: FieldValues): void {
  let errorJson: string = '{}';
  let errorArr: any[] = [];
  try {
    errorJson = JSON.stringify(serializableFormValidationError(formError));
    errorArr = transformErrorObj(serializableFormValidationError(formError));
  } catch (serializeError) {
    console.warn(
      `Error serializing error data for form validation error from ${origin}, sending event with no data`,
      serializeError,
    );
  }
  recordEvent('Form Error', {
    // eslint-disable-next-line camelcase
    form_str: origin,
    // eslint-disable-next-line camelcase
    errors_str: errorJson,
  });

  errorArr.forEach(error => {
    return recordEvent('Custom Error', {
      // eslint-disable-next-line camelcase
      form_str: origin,
      // eslint-disable-next-line camelcase
      field_str: Object.keys(error)[0],
      // eslint-disable-next-line camelcase
      error_str: JSON.stringify(error),
    });
  });
}

/**
 * Wrapping function, converts a standard form error handler into one which records the error in fullstory first
 * @param origin - A string identifying the form the error originated from
 * @param handler - The core error handling logic you want to augment
 * @return - the augmented handler, ready to use in a form
 */
export function recordingErrorHandler(
  origin: string,
  handler: SubmitErrorHandler<FieldValues>,
): SubmitErrorHandler<FieldValues> {
  return (error: FieldValues) => {
    recordFormValidationError(origin, error);
    handler(error);
  };
}

/**
 * Sends errors originating from thew back end to fullstory.com, under the event name 'Backend Error'
 * @param action - A string identifying the action being attempted when the error occurred
 * @param backendError - The error object produced by the back end interaction
 */
export function recordBackendError(action: string, backendError: Error): void {
  console.error(`Backend Error: ${action}`, backendError);
  recordEvent('Backend Error', {
    // eslint-disable-next-line camelcase
    action_str: action,
    // eslint-disable-next-line camelcase
    message_str: backendError.message ?? 'None Specified',
    // eslint-disable-next-line camelcase
    stack_str: backendError.stack ?? 'Unavailable',
  });
}
