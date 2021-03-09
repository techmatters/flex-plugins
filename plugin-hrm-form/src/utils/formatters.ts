import { truncate } from 'lodash';
import { format } from 'date-fns';

/**
 * @param {string} name
 */
export const formatName = name => (name && name.trim() !== '' ? name : 'Unknown');

/**
 * @param {string} street
 * @param {string} city
 * @param {string} state
 * @param {string} postalCode
 */
export const formatAddress = (street, city, state, postalCode) => {
  const commaSeparated = [street, city, state].filter(s => s.trim()).join(', ');
  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const withPostalCode = [commaSeparated, postalCode].filter(s => s.trim()).join(' ');
  return withPostalCode;
};

/**
 * @param {number} inSeconds
 */
export const formatDuration = inSeconds => {
  if (typeof inSeconds !== 'number') return null;

  const hours = Math.floor(inSeconds / 3600);
  const minutes = Math.floor(inSeconds / 60) % 60;
  const seconds = inSeconds - minutes * 60 - hours * 3600;

  const hh = hours ? `${hours}h ` : '';
  const mm = minutes || hours ? `${minutes}m ` : '';
  const ss = `${seconds}s`;

  return `${hh}${mm}${ss}`;
};

/**
 * @param {number} charLimit
 */
export const getShortSummary = (summary, charLimit, chooseMessage = 'call') => {
  if (!summary) {
    if (chooseMessage === 'case') return '- No case summary -';

    return '- No call summary -';
  }

  return truncate(summary, {
    length: charLimit,
    separator: /,?\.* +/, // TODO(murilo): Check other punctuations
  });
};

/**
 * Takes the categories object comming from the API and turns it into a strings array for ease of presentation
 * adding the category if the subcategory is "Unspecified/Other"
 * @param {{ [category: string]: string[] }} categories
 * @returns {string[]}
 */
export const formatCategories = categories =>
  // maybe we should define domain constants for the categories/subcategories in case we change them?
  Object.entries(categories).flatMap(([cat, subcats]: [string, any]) =>
    subcats.map(subcat => (subcat === 'Unspecified/Other' ? `${subcat} - ${cat}` : subcat)),
  );

export const formatDateTime = date => {
  const locale = navigator.language;
  const dateString = date.toLocaleDateString(locale);
  const timeString = date.toLocaleTimeString(locale, { timeStyle: 'short' }).replace('AM', 'am').replace('PM', 'pm');

  return `${dateString} at ${timeString}`;
};

/**
 * Formats Date Time (string) into a friendly readable format
 * @param dateTime 
 */
export const formatDateTimeString = (dateTime: string): string => {
  return `${format(new Date(dateTime), 'MMM d, yyyy / h:mm aaaaa')}m`;
}

/**
 * Formats a input value to string
 * @param value input value to format
 */
export const formatInputValue = (value: string): string => {
  return value ? value : '-';
};

/**
 * Formats a checkbox value to a Yes/No string
 * @param value checkbox value to format
 */
export const formatCheckboxValue = (value: boolean): 'Yes' | 'No' => {
  return value ? 'Yes' : 'No';
};