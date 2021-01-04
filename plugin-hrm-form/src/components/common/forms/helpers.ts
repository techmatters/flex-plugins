import { FormValues, isFormFieldType, LayoutValue } from './types';
import { isNotCategory } from '../../../states/ContactFormStateFactory';
import { splitDate } from '../../../utils/helpers';

export const getFormValues = <T>(formInformation: T): FormValues<T> => {
  const values = Object.keys(formInformation).reduce((accum, key) => {
    // do not iterate over metadata
    if (isNotCategory(key)) return accum;

    if (isFormFieldType(formInformation[key])) return { ...accum, [key]: formInformation[key].value };

    return { ...accum, [key]: getFormValues(formInformation[key]) };
  }, {} as FormValues<T>);

  return values;
};

/* * * * */
export const formatValue = (displayValue: LayoutValue) => (value: string | number | boolean) => {
  if (displayValue && displayValue.format === 'date' && typeof value === 'string') {
    const [y, m, d] = splitDate(value);
    return new Date(y, m - 1, d).toLocaleDateString(navigator.language);
  }

  return value;
};
