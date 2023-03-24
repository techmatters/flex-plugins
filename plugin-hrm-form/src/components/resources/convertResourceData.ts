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

const getSingleAttributeVal = (attributes: Object, language: string, keyName: string) => {
  if (keyName in attributes) {
    const propVal = attributes[keyName];
    if (propVal[0].hasOwnProperty('value') && typeof propVal[0].value === 'string') {
      const keysToKeep = ['primaryLocationIsPrivate', 'isLocationPrivate', 'isPrivate'];
      if (propVal[0].value === 'true' && !keysToKeep.includes(keyName)) {
        return 'Yes';
      } else if (propVal[0].value === 'false' && !keysToKeep.includes(keyName)) {
        return 'No';
      } else if (language === 'en' || propVal[0].language === '') {
        return propVal[0].value;
      } else if (language === 'fr') {
        return propVal[1].value;
      }
    }
  }
  return null;
};

const handleAgeRange = (attributes: Object, language: string) => {
  const eligibilityMinAge = getSingleAttributeVal(attributes, language, 'eligibilityMinAge');
  const eligibilityMaxAge = getSingleAttributeVal(attributes, language, 'eligibilityMaxAge');
  if (eligibilityMinAge && eligibilityMaxAge) {
    return `${eligibilityMinAge} - ${eligibilityMaxAge} years`;
  }
  return 'N/A';
};

const handlePrimaryLocation = (attributes: Object, language: string) => {
  const county = getSingleAttributeVal(attributes, language, 'primaryLocationCounty');
  const city = getSingleAttributeVal(attributes, language, 'primaryLocationCity');
  const province = getSingleAttributeVal(attributes, language, 'primaryLocationProvince');
  const postalCode = getSingleAttributeVal(attributes, language, 'primaryLocationPostalCode');
  const phone = getSingleAttributeVal(attributes, language, 'primaryLocationPhone');
  // eslint-disable-next-line prefer-named-capture-group
  const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

  return `${county}, ${city}\r\n${province}, ${postalCode}\r\n${formattedPhone}`;
};

export const convertKHPResourceData = (attributes, language) => {
  const mainContact = {
    name: getSingleAttributeVal(attributes.mainContact, language, 'name'),
    title: getSingleAttributeVal(attributes.mainContact, language, 'title'),
    phoneNumber: getSingleAttributeVal(attributes.mainContact, language, 'phoneNumber'),
    email: getSingleAttributeVal(attributes.mainContact, language, 'email'),
    isPrivate: getSingleAttributeVal(attributes.mainContact, language, 'isPrivate'),
  };
  const { operations, site } = attributes;

  return {
    status: getSingleAttributeVal(attributes, language, 'status'),
    taxonomyCode: getSingleAttributeVal(attributes, language, 'taxonomyCode'),
    description: getSingleAttributeVal(attributes.description, language, 'description'),
    mainContact,
    website: getSingleAttributeVal(attributes, language, 'website'),
    available247: getSingleAttributeVal(attributes, language, 'available247'),
    ageRange: handleAgeRange(attributes, language),
    targetPopulation: getSingleAttributeVal(attributes, language, 'targetPopulation'),
    interpretationTranslationServicesAvailable: getSingleAttributeVal(
      attributes,
      language,
      'interpretationTranslationServicesAvailable',
    ),
    feeStructureSource: getSingleAttributeVal(attributes, language, 'feeStructureSource'),
    howToAccessSupport: getSingleAttributeVal(attributes, language, 'howToAccessSupport'),
    applicationProcess: getSingleAttributeVal(attributes, language, 'applicationProcess'),
    howIsServiceOffered: getSingleAttributeVal(attributes, language, 'howIsServiceOffered'),
    accessibility: getSingleAttributeVal(attributes, language, 'accessibility'),
    documentsRequired: getSingleAttributeVal(attributes, language, 'documentsRequired'),
    primaryLocationIsPrivate: getSingleAttributeVal(attributes, language, 'primaryLocationIsPrivate') === 'true',
    primaryLocation: handlePrimaryLocation(attributes, language),
    operations,
    site,
  };
};
