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
 * Sends form validation errors to fullstory.com, under the event name 'Form Error'
 * Specvific form error information is sent as a JSON blob in a single property for now because I'm not sure how much fullstory likes dynamic payloads
 * In addition to 'Form Error', a custom 'Single Field Error' event is also sent which will separate the Form Error into specific field errors.
 * To achieve 'Single Field Error', the original error is cleaned up with serializableFormValidationError method and flattened into the errorArr which holds all the error objects in an array.
 * @param origin - A string identifying the form the error originated from
 * @param formError - The error object produced by the form validation (i.e. the first parameter of the error handler)
 */
export function recordFormValidationError(origin: string, formError: FieldValues): void {
  let errorJson: string = '{}';
  let errorObj: object = {};
  try {
    errorJson = JSON.stringify(serializableFormValidationError(formError));

    errorObj = serializableFormValidationError(formError);
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

  const errorArr = Object.values(errorObj)
    .flatMap(obj => Object.entries(obj))
    .map(([key, value]) => ({ [key]: value }));

  errorArr.map(error => {
    return recordEvent('Custom Error', {
      // eslint-disable-next-line camelcase
      form_str: origin,
      // eslint-disable-next-line camelcase
      field_str: `${Object.keys(error)}`,
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
  recordEvent('Backend Error', {
    // eslint-disable-next-line camelcase
    action_str: action,
    // eslint-disable-next-line camelcase
    message_str: backendError.message ?? 'None Specified',
    // eslint-disable-next-line camelcase
    stack_str: backendError.stack ?? 'Unavailable',
  });
}
