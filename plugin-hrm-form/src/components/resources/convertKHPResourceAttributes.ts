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

const extractAttributeValue = ({ value }: AttributeData) => {
  if (typeof value === 'boolean') {
    if (value) {
      return 'Yes';
    }
    return 'No';
  }
  return (value ?? '').toString();
};

const getAttributeValue = (attributes: Attributes | undefined, language: Language, keyName: string) =>
  extractAttributeValue(
    getAttributeData(attributes, language, keyName) ?? { value: undefined, language: '', info: null },
  );

const getBooleanAttributeValue = (attributes: Attributes | undefined, keyName: string) => {
  const { value } = getAttributeData(attributes, '', keyName) ?? {};
  return Boolean(value);
};

const getAttributeDataItems = (attributes: Attributes | undefined, language: Language, keyName: string) => {
  const propVal = (attributes ?? {})[keyName];
  if (!propVal || Array.isArray(propVal)) {
    return [];
  }
  return Object.keys(propVal)
    .map(itemKey => getAttributeData(propVal, language, itemKey))
    .filter(v => v);
};

const getAttributeNode = (attributes: Attributes | undefined, keyName: string): Attributes => {
  const propVal = (attributes ?? {})[keyName];
  if (!propVal || Array.isArray(propVal)) {
    return {};
  }
  return propVal;
};
const getAttributeValuesAsCsv = (attributes: Attributes | undefined, language: Language, keyName: string) =>
  getAttributeDataItems(attributes, language, keyName)
    .map(attributeData => extractAttributeValue(attributeData))
    .join(', ');

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
  const county = getAttributeData(attributes, language, 'primaryLocationRegion')?.info?.name;
  const city = getAttributeData(attributes, language, 'primaryLocationRegionCity')?.info?.name;
  const province = getAttributeData(attributes, language, 'primaryLocationProvince')?.info?.name;
  const postalCode = getAttributeValue(attributes, language, 'primaryLocationPostalCode');
  const phone = getAttributeValue(attributes, language, 'primaryLocationPhone');
  // eslint-disable-next-line prefer-named-capture-group
  const formattedPhone = phone?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

  return `${toCsv(address1, address2)}${toCsv(city, county)}${toCsv(province, postalCode)}${formattedPhone}`;
};

const extractMainContact = (mainContact: Attributes, language: Language) => {
  const name = getAttributeValue(mainContact, language, 'name');
  const title = getAttributeValue(mainContact, language, 'title');
  const phoneNumber = getAttributeValue(mainContact, language, 'phoneNumber');
  const email = getAttributeValue(mainContact, language, 'email');
  const isPrivate = getBooleanAttributeValue(mainContact, 'isPrivate');

  return {
    mainContactText: [name, title, phoneNumber, email].filter(v => v).join('\r\n'),
    isPrivate,
  };
};

const extractOperatingHours = (operations: Attributes, language: Language): KhpOperationsDay[] => {
  const { siteId, ...opsWithoutSiteId } = operations;
  return Object.values(opsWithoutSiteId ?? {})
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
      ? sets.find(s => !Array.isArray(s) && getAttributeValue(s, '', 'siteId') === siteId)
      : undefined;
    if (siteResourceOperations && !Array.isArray(siteResourceOperations)) {
      // The top level resource operations set should include a set of operations for each site, linked via siteId
      return extractOperatingHours(siteResourceOperations, language);
    } else if (siteOperations) {
      // If there is no set of operations for this resource at this site, return the operations from the site object (assuming there is one, if not return empty array)
      return extractOperatingHours(siteOperations, language);
    }
  }
  return [];
};

const extractSiteLocation = (site: Attributes) => {
  const location = getAttributeNode(site, 'location');
  return {
    address1: getAttributeValue(location, '', 'address1'),
    address2: getAttributeValue(location, '', 'address2'),
    city:
      getAttributeData(location, '', 'region-city')?.info?.name ||
      getAttributeData(location, '', 'city')?.info?.name ||
      '',
    county: getAttributeData(location, '', 'region')?.info?.name || getAttributeValue(location, '', 'county'),
    postalCode: getAttributeValue(location, '', 'postalCode'),
    province: getAttributeData(location, '', 'province')?.info?.name || '',
    country: getAttributeValue(location, '', 'country'),
    isPrivate: getBooleanAttributeValue(location, 'isPrivate'),
  };
};

const extractPhoneNumbers = (phoneObj: Attributes): Record<string, string> => {
  const phoneNumbers = {};
  Object.keys(phoneObj ?? {}).forEach(key => {
    const { info } = getAttributeData(phoneObj, '', key);
    phoneNumbers[(info.type ?? key).toLowerCase()] = `${info.number}${info.name ? ` (${info.name})` : ''}`;
  });
  return phoneNumbers;
};

const extractCoverageItemDescription = (coverageData: AttributeData): string => {
  const coverageInfo = coverageData?.info;
  if (coverageInfo) {
    // New coverage data format
    return (
      toCsv(coverageInfo.postalCode, coverageInfo.city, coverageInfo.region, coverageInfo.province) ||
      coverageInfo.country
    );
  }
  return '';
};

const extractCoverage = (coverage: Attributes, siteId: string = null): string => {
  const coverageList = Object.values(coverage ?? {});
  /*
   * Each item in the coverage object is an array of coverage items.
   * Should only ever be one item in the array but by flat mapping we're covered if there are more
   */
  const coverageDescription = coverageList
    .flatMap(coverageItems => {
      if (!Array.isArray(coverageItems)) {
        return [];
      }
      return coverageItems
        .filter(ci => {
          const itemSiteId = ci?.info?.siteId;
          return (!siteId && !itemSiteId) || (siteId && itemSiteId === siteId);
        })
        .map(extractCoverageItemDescription);
    })
    .filter(ci => ci)
    .join('\n');
  // If this is for the overall resource, there is no resource level coverage, but there is site specific coverage info, direct the user to the site info rather than just saying 'Not Listed'.
  if (!coverageDescription && !siteId && coverageList.length) {
    return 'Resources-View-Coverage-SeeSites';
  }
  return coverageDescription;
};

const extractSiteDetails = (resource: Attributes, sites: Attributes, language: Language) => {
  const siteDetails = [];
  const siteList = Object.keys(sites ?? {});
  for (const siteId of siteList) {
    const site = getAttributeNode(sites, siteId);
    const location = extractSiteLocation(site);
    const operationsAttributes = getAttributeNode(resource, 'operations');
    const coverageAttributes = getAttributeNode(resource, 'coverage');
    const siteOperations = getAttributeNode(site, 'operations');
    siteDetails.push({
      siteId,
      name: getAttributeValue(site, language, 'name') || getAttributeValue(site, language, 'nameDetails'),
      location,
      email: getAttributeValue(site, '', 'email'),
      operations: extractSiteOperatingHours(siteId, operationsAttributes, siteOperations, language),
      isActive: getBooleanAttributeValue(site, 'isActive'),
      details: getAttributeData(site, language, 'details')?.info?.details ?? '',
      phoneNumbers: extractPhoneNumbers(getAttributeNode(site, 'phone')),
      coverage: extractCoverage(coverageAttributes, siteId),
    });
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

const extractLanguages = (resource: Attributes) =>
  getAttributeDataItems(resource, '', 'languages')
    .map(attributeData => {
      const language = attributeData?.info?.language;
      if (language && typeof language === 'string') {
        return language;
      }
      return '';
    })
    .filter(l => l)
    .join(', ');

export const convertKHPResourceAttributes = (
  attributes: Attributes,
  language: Language,
): KhpUiResource['attributes'] => {
  if (!attributes || Array.isArray(attributes)) {
    throw new Error('Invalid attributes to convert to KHP resource');
  }
  const sites = attributes.site && !Array.isArray(attributes.site) ? attributes.site : {};
  const operations = attributes.operations && !Array.isArray(attributes.operations) ? attributes.operations : undefined;
  const coverage = attributes.coverage && !Array.isArray(attributes.coverage) ? attributes.coverage : undefined;
  const eligibility =
    attributes.eligibility && !Array.isArray(attributes.eligibility) ? attributes.eligibility : undefined;
  return {
    status: getAttributeValue(attributes, language, 'status'),
    taxonomyCode: getAttributeValue(attributes, language, 'taxonomyCode'),
    description: extractDescriptionInfo(attributes.description, language),
    mainContact:
      attributes.mainContact && !Array.isArray(attributes.mainContact)
        ? extractMainContact(attributes.mainContact, language)
        : { mainContactText: '', isPrivate: false },
    website: getAttributeValue(attributes, language, 'website'),
    operations: extractResourceOperatingHours(operations, language),
    available247: getAttributeValue(attributes, language, 'available247'),
    ageRange: extractAgeRange(attributes, language),
    targetPopulation: getAttributeValuesAsCsv(attributes, language, 'targetPopulation'),
    interpretationTranslationServicesAvailable: getAttributeValue(
      attributes,
      language,
      'interpretationTranslationServicesAvailable',
    ),
    feeStructureSource: getAttributeValuesAsCsv(attributes, language, 'feeStructure'),
    howToAccessSupport: getAttributeValuesAsCsv(attributes, language, 'howToAccessSupport'),
    applicationProcess: getAttributeValue(attributes, language, 'applicationProcess'),
    howIsServiceOffered: getAttributeValuesAsCsv(attributes, language, 'howIsServiceOffered'),
    languagesServiced: extractLanguages(attributes),
    accessibility: getAttributeValue(attributes, language, 'accessibility'),
    documentsRequired: extractRequiredDocuments(attributes.documentsRequired, language),
    primaryLocationIsPrivate: getBooleanAttributeValue(attributes, 'primaryLocationIsPrivate'),
    primaryLocation: extractPrimaryLocation(attributes, language),
    coverage: extractCoverage(coverage),
    eligibilityPhrase: getAttributeValue(eligibility, language, 'phrase'),
    site: extractSiteDetails(attributes, sites, language),
  };
};
