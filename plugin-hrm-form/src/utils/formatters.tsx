/**
 * Copyright (C) 2021-2023 Technology Matters
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

import React from 'react';
import { truncate } from 'lodash';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import type { FormItemDefinition } from '@tech-matters/hrm-form-definitions';

import { OpaqueText } from '../styles';

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
 * @param {string} summary - summary value
 * @param {number} charLimit - number of characters to truncate to
 * @param {string} chooseMessage - 'call', 'case', 'profile'
 */
export const getShortSummary = (summary, charLimit, chooseMessage = 'call') => {
  if (!summary) {
    if (chooseMessage === 'case')
      return (
        <OpaqueText>
          <Template code="CaseSummary-None" />
        </OpaqueText>
      );
    if (chooseMessage === 'profile')
      return (
        <OpaqueText>
          <Template code="ProfileList-Summary-None" />
        </OpaqueText>
      );

    return <Template code="CallSummary-None" />;
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
export const formatCategories = (categories: Record<string, string[]>) =>
  // maybe we should define domain constants for the categories/subcategories in case we change them?
  Object.entries(categories).flatMap(([cat, subcats]: [string, any]) =>
    subcats.map(subcat => (subcat === 'Unspecified/Other' ? `${subcat} - ${cat}` : subcat)),
  );

/**
 * Formats Date Time (string) into a friendly readable format
 * @param dateTime
 */
export const formatStringToDateAndTime = (dateTime: string): string => {
  return `${format(new Date(dateTime), 'MMM d, yyyy / h:mm aaaaa')}m`;
};

/**
 * Given instrunctions on how to render a single value and an array of values,
 * formats forms values into a readable string.
 */
export const presentValue = (
  renderValue: (code: string) => string | ReturnType<Template['render']>,
  renderArray: (codes: ReturnType<typeof renderValue>[]) => ReturnType<typeof renderValue>,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => (value: string | number | boolean | string[]) => (
  definition: FormItemDefinition = null,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  // eslint-disable-next-line dot-notation
  if (definition && definition.type === 'mixed-checkbox' && value === null) return renderValue('Unknown');

  if (definition && definition.type === 'listbox-multiselect' && Array.isArray(value))
    return renderArray(value.map(renderValue));

  if (typeof value === 'string' && value.trim()) return renderValue(value);
  if (typeof value === 'number') return renderValue(value.toString());
  if (typeof value === 'boolean') {
    if (value) return renderValue('SectionEntry-Yes');
    return renderValue('SectionEntry-No');
  }

  return '-';
};

/**
 * Removes the prefixed milliseconds from the fileName saved at AWS and returns only the original fileName
 * @param fileNameAtAws File Name of the resource at AWS
 * @returns Original file name
 */
export const formatFileNameAtAws = fileNameAtAws =>
  fileNameAtAws ? fileNameAtAws.substring(fileNameAtAws.indexOf('-') + 1) : '';
