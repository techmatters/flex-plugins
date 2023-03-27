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

import { Resource } from '../../types/types';

type Language = 'en' | 'fr' | '';

const getAttributeValue = (attributes, language: Language, keyName: string) => {
  if (keyName in attributes) {
    const propVal = attributes[keyName];
    if (propVal[0].hasOwnProperty('value') && typeof propVal[0].value === 'string') {
      const keysToKeep = ['primaryLocationIsPrivate', 'isLocationPrivate', 'isPrivate'];
      if (propVal[0].value === 'true' && !keysToKeep.includes(keyName)) {
        return 'Yes';
      } else if (propVal[0].value === 'false' && !keysToKeep.includes(keyName)) {
        return 'No';
      } else if (language === 'fr' && propVal[1]?.language === 'fr') {
        return propVal[1]?.value;
      }
      return propVal[0]?.value;
    }
  }
  return null;
};

const extractAgeRange = (attributes, language: Language) => {
  const eligibilityMinAge = getAttributeValue(attributes, language, 'eligibilityMinAge');
  const eligibilityMaxAge = getAttributeValue(attributes, language, 'eligibilityMaxAge');
  if (eligibilityMinAge && eligibilityMaxAge) {
    return `${eligibilityMinAge} - ${eligibilityMaxAge} years`;
  }
  return 'N/A';
};

const extractPrimaryLocation = (attributes, language: Language) => {
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
    const dayData = language === 'fr' ? operations[key][1] : operations[key][0];
    const { hoursOfOperation, descriptionOfHours, day } = dayData.info;
    return { day, hoursOfOperation, descriptionOfHours };
  });
};

const extractSiteLocation = (location: any) => {
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
        // isLocationPrivate: site.isLocationPrivate[0]?.value|| null,
        isActive: site.isActive[0]?.value || null,
        details: site.details[langKey]?.info?.description || '',
      });
    }
  }
  return siteDetails;
};

export const convertKHPResourceData = (attributes, language: Language): Resource['attributes'] => {
  return {
    status: getAttributeValue(attributes, language, 'status'),
    taxonomyCode: getAttributeValue(attributes, language, 'taxonomyCode'),
    description: attributes.description[0]?.info.text,
    mainContact: {
      name: getAttributeValue(attributes.mainContact, language, 'name'),
      title: getAttributeValue(attributes.mainContact, language, 'title'),
      phoneNumber: getAttributeValue(attributes.mainContact, language, 'phoneNumber'),
      email: getAttributeValue(attributes.mainContact, language, 'email'),
      isPrivate: getAttributeValue(attributes.mainContact, language, 'isPrivate'),
    },
    website: getAttributeValue(attributes, language, 'website'),
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
    documentsRequired: getAttributeValue(attributes, language, 'documentsRequired'),
    primaryLocationIsPrivate: getAttributeValue(attributes, language, 'primaryLocationIsPrivate') === 'true',
    primaryLocation: extractPrimaryLocation(attributes, language),
    operations: extractOperatingHours(attributes.operations, language),
    site: extractSiteDetails(attributes.site, language),
  };
};
