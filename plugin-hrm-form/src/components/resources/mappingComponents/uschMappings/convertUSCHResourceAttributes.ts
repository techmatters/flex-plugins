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

import { UschUiResource, Language } from './types';
import { AttributeData, Attributes } from '../../../../services/ResourceService';
import { getAttributeData, getAttributeDataFromList, getAttributeValue, toCsv } from '../extractors';

const extractAddress = (attributes: Attributes, language: Language) => {
  const { address } = attributes;

  if (Array.isArray(address)) {
    return '';
  }

  const street = getAttributeData(address, language, 'street')?.value.toString();
  const city = getAttributeData(address, language, 'city')?.value.toString();
  const country = getAttributeData(address, language, 'country')?.value.toString();
  const postalCode = getAttributeData(address, language, 'postalCode')?.value.toString();
  // province is not inside address object
  const province = getAttributeData(attributes, language, 'stateProvince')?.value.toString();

  return `${toCsv(street)}${toCsv(city, postalCode)}${toCsv(province, country)}`;
};

const extractCoverage = (coverage: Attributes): string => {
  console.log('>>>>>> extractCoverage')
  const coverageList = Object.values(coverage ?? {});
  /*
   * Each item in the coverage object is an array of coverage items.
   * Should only ever be one item in the array but by flat mapping we're covered if there are more
   */
  return coverageList
    .flatMap(coverageItems => {
      if (!Array.isArray(coverageItems)) {
        return [];
      }
      return coverageItems.map(ci => ci?.value);
    })
    .filter(ci => ci)
    .join('\n');
};

const extractDescriptionInfo = (description, language: Language) => {
  const descriptionByLanguage = description?.find(item => item.language === language || item.language === '');
  return descriptionByLanguage && descriptionByLanguage.info ? descriptionByLanguage.info.text : null;
};

const extractPhoneNumbers = (attributes: Attributes, language: Language) => {
  console.log('>>>>>> extractPhoneNumbers')
  return Object.entries(attributes.phone || {})
    .map(([type, p]) => {
      const name = getAttributeDataFromList(p.name, language);
      const number = getAttributeDataFromList(p.number, language);
      const description = getAttributeDataFromList(p.description, language);

      if (!number.value) return null;

      return {
        number: number.value.toString(),
        name: name?.value.toString() || type,
        description: description?.value.toString(),
      };
    })
    .filter(Boolean);
};

const extractCategories = (attributes: Attributes, language: Language) => {
  console.log('>>>>>> extractCategories')
  return Object.values(attributes.categories || {})
    .map(c => {
      return getAttributeDataFromList(c, language).value?.toString();
    })
    .filter(Boolean);
};

export const convertUSCHResourceAttributes = (
  attributes: Attributes,
  language: Language,
): UschUiResource['attributes'] => {
  if (!attributes || Array.isArray(attributes)) {
    throw new Error('Invalid attributes to convert to KHP resource');
  }
  const coverage = attributes.coverage && !Array.isArray(attributes.coverage) ? attributes.coverage : undefined;
  const phoneNumbers = extractPhoneNumbers(attributes, language);
  const categories = extractCategories(attributes, language);
  const alternateName = getAttributeValue(attributes, language, 'alternateName');
  const comment = getAttributeValue(attributes, language, 'comment');
  const feeStructure = getAttributeValue(attributes, language, 'feeStructure');
  const hoursOfOperation = getAttributeValue(attributes, language, 'hoursOfOperation');
  const hoursFormatted = getAttributeValue(attributes, language, 'hoursFormatted');
  const phoneFax = getAttributeValue(attributes, language, 'phoneFax');
  const shortDescription = getAttributeValue(attributes, language, 'shortDescription');
  const emailAddress = getAttributeValue(attributes, language, 'emailAddress');
  const websiteAddress = getAttributeValue(attributes, language, 'websiteAddress');

  return {
    address: extractAddress(attributes, language),
    alternateName,
    categories,
    comment,
    coverage: extractCoverage(coverage),
    description: extractDescriptionInfo(attributes.description, language),
    emailAddress,
    feeStructure,
    hoursFormatted,
    hoursOfOperation,
    phoneNumbers,
    phoneFax,
    shortDescription,
    websiteAddress,
  };
};
