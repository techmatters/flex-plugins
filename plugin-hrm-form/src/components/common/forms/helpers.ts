import { LayoutValue } from 'hrm-form-definitions';

import { splitDate } from '../../../utils/helpers';

/**
 * Given a displayValue spec for a certain form field and a value (current state of such field),
 * formats the value accordingly. E.g. from a date string, creates a date object without the locale timezone offset difference
 */
export const formatValue = (displayValue: LayoutValue) => (value: string | number | boolean) => {
  if (displayValue && displayValue.format === 'date' && typeof value === 'string') {
    const [y, m, d] = splitDate(value);
    return new Date(y, m - 1, d).toLocaleDateString(navigator.language);
  }
  return value;
};
