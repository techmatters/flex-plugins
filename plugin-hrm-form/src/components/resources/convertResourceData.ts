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

const getAttributeValue = (attributes: Object, language: string, keyName: string) => {
  if (keyName in attributes) {
    const propVal = attributes[keyName];
    if (propVal[0].hasOwnProperty('value') && typeof propVal[0].value === 'string') {
      const keysToKeep = ['primaryLocationIsPrivate', 'isLocationPrivate', 'isPrivate'];
      if (propVal[0].value === 'true' && !keysToKeep.includes(keyName)) {
        return 'Yes';
      } else if (propVal[0].value === 'false' && !keysToKeep.includes(keyName)) {
        return 'No';
      } else if (language === 'fr' && propVal[1]?.language === 'fr') {
        return propVal[1].value;
      }
      return propVal[0].value;
    }
  }
  return null;
};

const handleAgeRange = (attributes: Object, language: string) => {
  const eligibilityMinAge = getAttributeValue(attributes, language, 'eligibilityMinAge');
  const eligibilityMaxAge = getAttributeValue(attributes, language, 'eligibilityMaxAge');
  if (eligibilityMinAge && eligibilityMaxAge) {
    return `${eligibilityMinAge} - ${eligibilityMaxAge} years`;
  }
  return 'N/A';
};

const handlePrimaryLocation = (attributes: Object, language: string) => {
  const county = getAttributeValue(attributes, language, 'primaryLocationCounty');
  const city = getAttributeValue(attributes, language, 'primaryLocationCity');
  const province = getAttributeValue(attributes, language, 'primaryLocationProvince');
  const postalCode = getAttributeValue(attributes, language, 'primaryLocationPostalCode');
  const phone = getAttributeValue(attributes, language, 'primaryLocationPhone');
  // eslint-disable-next-line prefer-named-capture-group
  const formattedPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

  return `${county}, ${city}\r\n${province}, ${postalCode}\r\n${formattedPhone}`;
};

// const handleOperatingHours = (operations, language) => {
//   const operationsObj = Object.keys(operations).reduce((obj, key) => {
//     const dayData = language === 'fr' ? operations[key][1] : operations[key][0];
//     const { hoursOfOperation, descriptionOfHours, day } = dayData.info;
//     obj[day] = { hoursOfOperation, descriptionOfHours };
//     return obj;
//   }, {});
//   const operationsArray = Object.entries(operationsObj).map(([day, { hoursOfOperation, descriptionOfHours }]) => ({
//     day,
//     hoursOfOperation,
//     descriptionOfHours
//   }));
// };
const handleOperatingHours = (operations: any, language: string) => {
  type OperatingHours = {
    [day: string]: {
      hoursOfOperation: string| string[] | null,
      descriptionOfHours: string | null
    }
  }
  const operationsObj = Object.keys(operations).reduce((obj: OperatingHours, key) => {
    const dayData = language === 'fr' ? operations[key][1] : operations[key][0]
    const { hoursOfOperation, descriptionOfHours, day } = dayData.info;
    obj[day] = { hoursOfOperation, descriptionOfHours };
    return obj;
  }, {});
  const operationsArray = Object.entries(operationsObj).map(([day, { hoursOfOperation, descriptionOfHours }]) => ({
    day,
    hoursOfOperation,
    descriptionOfHours
  }));
  return operationsArray;
}


export const convertKHPResourceData = (attributes, language) => {
  const { site } = attributes;
  console.log('>>> attributes', attributes);
  // console.log('>>> site', attributes.site)

  return {
    status: getAttributeValue(attributes, language, 'status'),
    taxonomyCode: getAttributeValue(attributes, language, 'taxonomyCode'),
    description: attributes.description[0].info.text,
    mainContact: {
      name: getAttributeValue(attributes.mainContact, language, 'name'),
      title: getAttributeValue(attributes.mainContact, language, 'title'),
      phoneNumber: getAttributeValue(attributes.mainContact, language, 'phoneNumber'),
      email: getAttributeValue(attributes.mainContact, language, 'email'),
      isPrivate: getAttributeValue(attributes.mainContact, language, 'isPrivate'),
    },
    website: getAttributeValue(attributes, language, 'website'),
    available247: getAttributeValue(attributes, language, 'available247'),
    ageRange: handleAgeRange(attributes, language),
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
    primaryLocation: handlePrimaryLocation(attributes, language),
    operations: handleOperatingHours(attributes.operations, language),
    site,
  };
};
