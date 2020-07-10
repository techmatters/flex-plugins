import { truncate } from 'lodash';

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
 * @param {{ [category: string]: { [subcategory: string]: boolean } }} categories categories object
 * @returns {string[]} returns an array conaining the tags of the contact as strings (if any)
 */
export const retrieveCategories = categories => {
  const cats = Object.entries(categories);
  const subcats = cats.flatMap(([_, subs]) => Object.entries(subs));

  const flattened = subcats.map(([subcat, bool]) => {
    if (bool) return subcat;
    return null;
  });

  const tags = flattened.reduce((acc, curr) => {
    if (curr) return [...acc, curr];
    return acc;
  }, []);

  return tags;
};
