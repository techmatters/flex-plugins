import React from 'react';
import { truncate } from 'lodash';
import { format } from 'date-fns';

import { getConfig } from '../HrmFormPlugin';
import { FormItemDefinition } from '../components/common/forms/types';
import { channelTypes } from '../states/DomainConstants';
import { getNumberFromTask } from '../services/ContactService';

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
export const formatStringToDateAndTime = (dateTime: string): string => {
  return `${format(new Date(dateTime), 'MMM d, yyyy / h:mm aaaaa')}m`;
};

/**
 * Formats a form value into a readable string.
 * @param value Value to format
 */
export const presentValue = (value: string | number | boolean) => (definition: FormItemDefinition = null) => {
  const { strings } = getConfig();

  // eslint-disable-next-line dot-notation
  if (definition && definition.type === 'mixed-checkbox' && value === null) return strings['Unknown'];
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') {
    if (value) return strings['SectionEntry-Yes'];
    return strings['SectionEntry-No'];
  }

  return '-';
};

/**
 *
 * @param {ITask | CustomITask} task
 * @param contactNumberFromTask
 */

export const formatNumberFromTask = task =>
  task.channelType === channelTypes.twitter ? `@${task.attributes.twitterUserHandle}` : getNumberFromTask(task);

/**
 * Removes the prefixed milliseconds from the fileName saved at AWS and returns only the original fileName
 * @param fileNameAtAws File Name of the resource at AWS
 * @returns Original file name
 */
export const formatFileNameAtAws = fileNameAtAws =>
  fileNameAtAws ? fileNameAtAws.substring(fileNameAtAws.indexOf('-') + 1) : '';
