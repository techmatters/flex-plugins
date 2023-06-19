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

import { KhpOperationsDay, KhpUiResource, Language } from './types';
import { AttributeData, Attributes } from '../../services/ResourceService';

const getAttributeData = (attributes: Attributes | undefined, language: Language, keyName: string): AttributeData => {
  const propDataList = (attributes ?? {})[keyName];
  if (propDataList && Array.isArray(propDataList)) {
    const propDataByLanguage = propDataList.find(item => item?.language === language || item?.language === '');
    if (propDataByLanguage && 'value' in propDataByLanguage && typeof propDataByLanguage.value === 'string') {
      return propDataByLanguage;
    } else if ('value' in propDataList[0]) {
      return propDataList[0];
    }
  }
  return undefined;
};

const getAttributeValue = (attributes: Attributes | undefined, language: Language, keyName: string) => {
  const { value } = getAttributeData(attributes, language, keyName) ?? {};
  if (typeof value === 'boolean') {
    if (value) {
      return 'Yes';
    }
    return 'No';
  }
  return (value ?? '').toString();
};

const getBooleanAttributeValue = (attributes: Attributes | undefined, keyName: string) => {
  const { value } = getAttributeData(attributes, '', keyName) ?? {};
  return Boolean(value);
};

const getAttributeValuesAsCsv = (attributes: Attributes | undefined, language: Language, keyName: string) => {
  const propVal = (attributes ?? {})[keyName];
  if (!propVal || Array.isArray(propVal)) {
    return '';
  }
  return Object.keys(propVal)
    .map(itemKey => getAttributeValue(propVal, language, itemKey))
    .filter(v => v)
    .join(', ');
};

const extractAgeRange = (attributes: Attributes, language: Language) => {
  const eligibilityMinAge = getAttributeValue(attributes, language, 'eligibilityMinAge');
  const eligibilityMaxAge = getAttributeValue(attributes, language, 'eligibilityMaxAge');
  if (eligibilityMinAge || eligibilityMaxAge) {
    return `${eligibilityMinAge} - ${eligibilityMaxAge} years`;
  }
  return 'N/A';
};

const toCsv = (...args: string[]) => {
  const text = args.filter(v => v).join(', ');
  return text ? `${text}\r\n` : '';
};

const extractPrimaryLocation = (attributes: Attributes, language: Language) => {
  const address1 = getAttributeValue(attributes, language, 'primaryLocationAddress1');
  const address2 = getAttributeValue(attributes, language, 'primaryLocationAddress2');
  const county = getAttributeValue(attributes, language, 'primaryLocationCounty');
  const city = getAttributeData(attributes, language, 'primaryLocationCity')?.info?.name;
  const province = getAttributeData(attributes, language, 'primaryLocationProvince')?.info?.name;
  const postalCode = getAttributeValue(attributes, language, 'primaryLocationPostalCode');
  const phone = getAttributeValue(attributes, language, 'primaryLocationPhone');
  // eslint-disable-next-line prefer-named-capture-group
  const formattedPhone = phone?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

  return `${toCsv(address1, address2)}${toCsv(county, city)}${toCsv(province, postalCode)}${formattedPhone}`;
};

const extractOperatingHours = (operations: Attributes, language: Language): KhpOperationsDay[] => {
  return Object.values(operations ?? {})
    .flat()
    .filter(item => item.language === language || item.language === '')
    .map(({ value, info }, index) => {
      const khpOperationsDayInfo = info as KhpOperationsDay;
      return {
        key: index.toString(),
        day: value?.toString(),
        hoursOfOperation: khpOperationsDayInfo?.hoursOfOperation,
        descriptionOfHours: khpOperationsDayInfo?.descriptionOfHours,
      };
    });
};

const extractResourceOperatingHours = (
  operationsList: Attributes | undefined,
  language: Language,
): KhpOperationsDay[] => {
  if (operationsList) {
    const sets = Object.values(operationsList);
    const resourceOperations = sets.find(s => !Array.isArray(s) && s.siteId);
    if (resourceOperations && !Array.isArray(resourceOperations)) {
      return extractOperatingHours(resourceOperations, language);
    } else if (sets.length === 1 && !Array.isArray(sets[0])) {
      /*
       * If there is no global 'resource operations' set and only one site level operations set, return that for the resource
       * Don't return anything if there are no global 'resource operations' sets and more than one site level operations set
       */
      return extractOperatingHours(sets[0], language);
    }
  }
  return [];
};

const extractSiteOperatingHours = (
  siteId: string,
  resourceOperationsList: Attributes,
  siteOperations: Attributes | undefined,
  language: Language,
): KhpOperationsDay[] => {
  if (resourceOperationsList) {
    const sets = Object.values(resourceOperationsList);
    const siteResourceOperations = siteId
      ? sets.find(s => !Array.isArray(s) && Array.isArray(s.siteId) && s.siteId[0].value === siteId)
      : undefined;
    if (siteResourceOperations && !Array.isArray(siteResourceOperations)) {
      // The top level resource operations set should include a set of operations for each site, linked via siteId
      return extractOperatingHours(siteResourceOperations, language);
    } else if (Array.isArray(siteOperations) && siteOperations.length > 0) {
      /*
       * If there is no set of operations for this resource at this site, return the operations from the site object (assuming there is one, if not return empty array)
       * Unsure as to the use case for a site having more than one set of operations, but let's just return the first one
       */
      return extractOperatingHours(siteOperations[0], language);
    }
  }
  return [];
};

const extractSiteLocation = location => {
  return {
    address1: getAttributeValue(location, '', 'address1'),
    address2: getAttributeValue(location, '', 'address2'),
    city: getAttributeData(location, '', 'city')?.info?.name || '',
    county: getAttributeValue(location, '', 'county'),
    postalCode: getAttributeValue(location, '', 'postalCode'),
    province: getAttributeData(location, '', 'province')?.info?.name || '',
    country: getAttributeValue(location, '', 'country'),
    isPrivate: getBooleanAttributeValue(location, 'isPrivate'),
  };
};

const extractPhoneNumbers = (phoneObj: any) => {
  const phoneNumbers = {};
  for (const key in phoneObj ?? {}) {
    if (phoneObj.hasOwnProperty(key)) {
      const phoneData = phoneObj[key];
      if (phoneData[0].hasOwnProperty('value')) {
        phoneNumbers[key] = phoneData[0].value;
      }
    }
  }
  return phoneNumbers;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const extractSiteDetails = (resource: Attributes, sites: Attributes, language: Language) => {
  const siteDetails = [];
  if (!Array.isArray(sites)) {
    const siteList = Object.entries(sites ?? {});
    for (const [key, site] of siteList) {
      const langKey = language === 'fr' ? 1 : 0;
      if (site && !Array.isArray(site)) {
        const siteId = site.siteId?.[0]?.value;
        const location = extractSiteLocation(site.location);
        const operationsAttributes = Array.isArray(resource.operations) ? {} : resource.operations;
        const siteOperations = Array.isArray(site.operations) ? {} : site.operations;
        siteDetails.push({
          siteId: key,
          name: site.name?.[langKey]?.value || site.nameDetails?.[langKey]?.value || '',
          location,
          email: site.email?.[0]?.value || '',
          operations: extractSiteOperatingHours(siteId, operationsAttributes, siteOperations, language),
          isActive: site.isActive?.[0]?.value,
          details: site.details?.[langKey]?.info?.description || '',
          phoneNumbers: extractPhoneNumbers(site.phone),
        });
      }
    }
  }
  return siteDetails;
};

const extractDescriptionInfo = (description, language: Language) => {
  const descriptionByLanguage = description?.find(item => item.language === language || item.language === '');
  return descriptionByLanguage && descriptionByLanguage.info ? descriptionByLanguage.info.text : null;
};

const extractRequiredDocuments = (documentsRequired, language: Language) => {
  const documents = [];
  for (const key in documentsRequired ?? {}) {
    if (documentsRequired.hasOwnProperty(key)) {
      const document = documentsRequired[key];
      const documentByLanguage = document.find(item => item.language === language || item.language === '');

      if (documentByLanguage.hasOwnProperty('value')) {
        documents.push(documentByLanguage.value);
      }
    }
  }
  return documents.join(', ');
};

const extractTargetPopulation = targetPopulationAttribute => ((targetPopulationAttribute ?? [])[0] ?? [])[0]?.value;

export const convertKHPResourceAttributes = (
  attributes: Attributes,
  language: Language,
): KhpUiResource['attributes'] => {
  if (!attributes || Array.isArray(attributes)) {
    throw new Error('Invalid attributes to convert to KHP resource');
  }
  if (!attributes.mainContact || Array.isArray(attributes.mainContact)) {
    throw new Error('Invalid attributes.mainContact to convert to KHP resource');
  }
  const sites = attributes.site && !Array.isArray(attributes.site) ? attributes.site : {};
  const operations = attributes.operations && !Array.isArray(attributes.operations) ? attributes.operations : undefined;
  return {
    status: getAttributeValue(attributes, language, 'status'),
    taxonomyCode: getAttributeValue(attributes, language, 'taxonomyCode'),
    description: extractDescriptionInfo(attributes.description, language),
    mainContact: {
      name: getAttributeValue(attributes.mainContact, language, 'name'),
      title: getAttributeValue(attributes.mainContact, language, 'title'),
      phoneNumber: getAttributeValue(attributes.mainContact, language, 'phoneNumber'),
      email: getAttributeValue(attributes.mainContact, language, 'email'),
      isPrivate: getBooleanAttributeValue(attributes.mainContact, 'isPrivate'),
    },
    website: getAttributeValue(attributes, language, 'website'),
    operations: extractResourceOperatingHours(operations, language),
    available247: getAttributeValue(attributes, language, 'available247'),
    ageRange: extractAgeRange(attributes, language),
    targetPopulation: extractTargetPopulation(attributes.targetPopulation),
    interpretationTranslationServicesAvailable: getAttributeValue(
      attributes,
      language,
      'interpretationTranslationServicesAvailable',
    ),
    feeStructureSource: getAttributeValuesAsCsv(attributes, language, 'feeStructure'),
    howToAccessSupport: getAttributeValuesAsCsv(attributes, language, 'howToAccessSupport'),
    applicationProcess: getAttributeValue(attributes, language, 'applicationProcess'),
    howIsServiceOffered: getAttributeValuesAsCsv(attributes, language, 'howIsServiceOffered'),
    accessibility: getAttributeValue(attributes, language, 'accessibility'),
    documentsRequired: extractRequiredDocuments(attributes.documentsRequired, language),
    primaryLocationIsPrivate: getBooleanAttributeValue(attributes, 'primaryLocationIsPrivate'),
    primaryLocation: extractPrimaryLocation(attributes, language),
    site: extractSiteDetails(attributes, sites, language),
  };
};
