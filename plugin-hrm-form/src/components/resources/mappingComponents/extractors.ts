/* eslint-disable import/no-unused-modules */
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

import { AttributeData, Attributes } from '../../../services/ResourceService';

export const getAttributeDataFromList = (
  propDataList: Attributes | AttributeData<any>[] | undefined,
  language: string,
): AttributeData => {
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

export const getAttributeData = (
  attributes: Attributes | undefined,
  language: string,
  keyName: string,
): AttributeData => {
  const propDataList = (attributes ?? {})[keyName];
  return getAttributeDataFromList(propDataList, language);
};

export const extractAttributeValue = ({ value }: AttributeData) => {
  if (typeof value === 'boolean') {
    if (value) {
      return 'Yes';
    }
    return 'No';
  }
  return (value ?? '').toString();
};

export const getAttributeValue = (attributes: Attributes | undefined, language: string, keyName: string) =>
  extractAttributeValue(
    getAttributeData(attributes, language, keyName) ?? { value: undefined, language: '', info: null },
  );

export const getBooleanAttributeValue = (attributes: Attributes | undefined, keyName: string) => {
  const { value } = getAttributeData(attributes, '', keyName) ?? {};
  return Boolean(value);
};

export const getAttributeDataItems = (attributes: Attributes | undefined, language: string, keyName: string) => {
  const propVal = (attributes ?? {})[keyName];
  if (!propVal || Array.isArray(propVal)) {
    return [];
  }
  return Object.keys(propVal)
    .map(itemKey => getAttributeData(propVal, language, itemKey))
    .filter(v => v);
};

export const getAttributeNode = (attributes: Attributes | undefined, keyName: string): Attributes => {
  const propVal = (attributes ?? {})[keyName];
  if (!propVal || Array.isArray(propVal)) {
    return {};
  }
  return propVal;
};
export const getAttributeValuesAsCsv = (attributes: Attributes | undefined, language: string, keyName: string) =>
  getAttributeDataItems(attributes, language, keyName)
    .map(attributeData => extractAttributeValue(attributeData))
    .join(', ');

export const toCsv = (...args: string[]) => {
  const text = args.filter(v => v).join(', ');
  return text ? `${text}\r\n` : '';
};

export const extractArrayAttribute = (key: string) => (
  attributes: Attributes,
  language: string,
): AttributeData['value'][] => {
  if (!attributes[key]) {
    return ['N/A'];
  }

  return Object.values(attributes[key]).flatMap(attr =>
    Array.isArray(attr)
      ? attr.filter(item => item.language === language || item.language === '').map(({ value }) => value)
      : [],
  );
};
