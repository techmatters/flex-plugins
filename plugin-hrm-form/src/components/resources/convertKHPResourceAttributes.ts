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

import { KhpUiResource, Language } from './types';

type Attributes = {
  [key: string]: any;
};

const getAttributeValue = (attributes: Attributes, language: Language, keyName: string) => {
  if (keyName in attributes) {
    const propVal = attributes[keyName];
    if (propVal.length === 0) {
      return null;
    }
    const propValueByLanguage = propVal.find(item => item.language === language || item.language === '');
    if (propValueByLanguage && 'value' in propValueByLanguage && typeof propValueByLanguage.value === 'string') {
      return propValueByLanguage.value;
    } else if (propVal && 'value' in propVal[0] && typeof propVal[0].value === 'boolean') {
      // For keysToKeep, do not change to Yes / No responses
      const keysToKeep = ['primaryLocationIsPrivate', 'isLocationPrivate', 'isPrivate'];

      if (propVal[0].value === true && !keysToKeep.includes(keyName)) {
        return 'Yes';
      } else if (propVal[0].value === false && !keysToKeep.includes(keyName)) {
        return 'No';
      }
    }
    return propVal[0].value;
  }
  return null;
};

const extractAgeRange = (attributes: Attributes, language: Language) => {
  const eligibilityMinAge = getAttributeValue(attributes, language, 'eligibilityMinAge');
  const eligibilityMaxAge = getAttributeValue(attributes, language, 'eligibilityMaxAge');
  if (eligibilityMinAge || eligibilityMaxAge) {
    return `${eligibilityMinAge} - ${eligibilityMaxAge} years`;
  }
  return 'N/A';
};

const extractPrimaryLocation = (attributes: Attributes, language: Language) => {
  const county = getAttributeValue(attributes, language, 'primaryLocationCounty');
  const city = getAttributeValue(attributes, language, 'primaryLocationCity');
  const province = getAttributeValue(attributes, language, 'primaryLocationProvince');
  const postalCode = getAttributeValue(attributes, language, 'primaryLocationPostalCode');
  const phone = getAttributeValue(attributes, language, 'primaryLocationPhone');
  // eslint-disable-next-line prefer-named-capture-group
  const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

  return `${county}, ${city}\r\n${province}, ${postalCode}\r\n${formattedPhone}`;
};

const extractOperatingHours = (operations: any, language: Language) => {
  return Object.keys(operations).map(key => {
    const dayData = operations[key].find(item => item.language === language || item.language === '');
    const { hoursOfOperation, descriptionOfHours, day } = dayData.info;
    return { day, hoursOfOperation, descriptionOfHours };
  });
};

const extractSiteLocation = location => {
  return {
    address1: location.address1[0]?.value || '',
    address2: location.address2[0]?.value || '',
    city: location.city[0]?.value || '',
    county: location.county[0]?.value || '',
    postalCode: location.postalCode[0]?.value || '',
    province: location.province[0]?.info?.name || '',
    country: location.country[0]?.value || '',
  };
};

const extractPhoneNumbers = (phoneObj: Object) => {
  const phoneNumbers = {};
  for (const key in phoneObj) {
    if (phoneObj.hasOwnProperty(key)) {
      const phoneData = phoneObj[key];
      if (phoneData[0].hasOwnProperty('value')) {
        phoneNumbers[key] = phoneData[0].value;
      }
    }
  }
  return phoneNumbers;
};

const extractSiteDetails = (sites: Object, language: Language) => {
  const siteDetails = [];
  for (const key in sites) {
    if (sites.hasOwnProperty(key)) {
      const langKey = language === 'fr' ? 1 : 0;
      const site = sites[key];
      const location = extractSiteLocation(site.location);
      siteDetails.push({
        siteId: key,
        name: site.name[langKey]?.value || '',
        location,
        email: site.email[0]?.value || '',
        operations: extractOperatingHours(site.operations, language),
        /*
         * isLocationPrivate: site.isLocationPrivate[0]?.value || false,
         * isActive: site.isActive[0]?.value,
         */
        details: site.details[langKey]?.info?.description || '',
        phoneNumbers: extractPhoneNumbers(site.phone),
      });
    }
  }
  return siteDetails;
};

const extractDescriptionInfo = (description, language: Language) => {
  const descriptionByLanguage = description.find(item => item.language === language || item.language === '');
  return descriptionByLanguage && descriptionByLanguage.info ? descriptionByLanguage.info.text : null;
};

const extractRequiredDocuments = (documentsRequired, language: Language) => {
  const documents = [];

  for (const key in documentsRequired) {
    if (documentsRequired.hasOwnProperty(key)) {
      const document = documentsRequired[key];
      const documentByLanguage = document.find(item => item.language === language || item.language === '');

      if (documentByLanguage.hasOwnProperty('value')) {
        documents.push(documentByLanguage.value);
      }
    }
  }
  return documents;
};

export const convertKHPResourceAttributes = (
  attributes: Attributes,
  language: Language,
): KhpUiResource['attributes'] => {
  return {
    status: getAttributeValue(attributes, language, 'status'),
    taxonomyCode: getAttributeValue(attributes, language, 'taxonomyCode'),
    description: extractDescriptionInfo(attributes.description, language),
    mainContact: {
      name: getAttributeValue(attributes.mainContact, language, 'name'),
      title: getAttributeValue(attributes.mainContact, language, 'title'),
      phoneNumber: getAttributeValue(attributes.mainContact, language, 'phoneNumber'),
      email: getAttributeValue(attributes.mainContact, language, 'email'),
      isPrivate: getAttributeValue(attributes.mainContact, language, 'isPrivate'),
    },
    website: getAttributeValue(attributes, language, 'website'),
    operations: extractOperatingHours(attributes.operations, language),
    available247: getAttributeValue(attributes, language, 'available247'),
    ageRange: extractAgeRange(attributes, language),
    targetPopulation: attributes.targetPopulation[0][0].value,
    interpretationTranslationServicesAvailable: getAttributeValue(
      attributes,
      language,
      'interpretationTranslationServicesAvailable',
    ),
    feeStructureSource: getAttributeValue(attributes, language, 'feeStructureSource'),
    howToAccessSupport: getAttributeValue(attributes, language, 'howToAccessSupport'),
    applicationProcess: getAttributeValue(attributes, language, 'applicationProcess'),
    howIsServiceOffered: getAttributeValue(attributes, language, 'howIsServiceOffered'),
    accessibility: getAttributeValue(attributes, language, 'accessibility'),
    documentsRequired: extractRequiredDocuments(attributes.documentsRequired, language),
    primaryLocationIsPrivate: getAttributeValue(attributes, language, 'primaryLocationIsPrivate') === false,
    primaryLocation: extractPrimaryLocation(attributes, language),
    site: extractSiteDetails(attributes.site, language),
  };
};
