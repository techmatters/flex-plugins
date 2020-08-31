import { FormValues, isFormFieldType } from './types';
import { isNotCategory } from '../../../states/ContactFormStateFactory';

export const getFormValues = <T>(formInformation: T): FormValues<T> => {
  const values = Object.keys(formInformation).reduce((accum, key) => {
    // do not iterate over metadata
    if (isNotCategory(key)) return accum;

    if (isFormFieldType(formInformation[key])) return { ...accum, [key]: formInformation[key].value };

    return { ...accum, [key]: getFormValues(formInformation[key]) };
  }, {} as FormValues<T>);

  return values;
};
