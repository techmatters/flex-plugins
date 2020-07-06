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
export const getShortSummary = (summary, charLimit, chooseMessage) => {
  if (!summary) {
    if (chooseMessage === 'case') return '- No case summary -';

    return '- No call summary -';
  }

  return truncate(summary, {
    length: charLimit,
    separator: /,?\.* +/, // TODO(murilo): Check other punctuations
  });
};
