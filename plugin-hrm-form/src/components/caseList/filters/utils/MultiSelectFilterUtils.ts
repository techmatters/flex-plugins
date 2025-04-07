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

import type { DefinitionVersion } from 'hrm-form-definitions';

import { CounselorHash } from '../../../../types/types';
import { Item } from '../MultiSelectFilter';

/**
 * Reads the definition version and returns and array of items (type Item[])
 * to be used as the options for the status filter
 * @param definitionVersion DefinitionVersion
 * @returns Item[]
 */
export const getStatusInitialValue = (definitionVersion: DefinitionVersion) =>
  definitionVersion
    ? Object.values(definitionVersion.caseStatus).map(caseStatus => ({
        value: caseStatus.value,
        label: caseStatus.label,
        checked: false,
      }))
    : [];

/**
 * Reads the counselors hash and returns and array of items (type Item[])
 * to be used as the options for the counselors filter
 * @param counselorsHash CounselorHash
 * @returns Item[]
 */
export const getCounselorsInitialValue = (counselorsHash: CounselorHash) =>
  Object.keys(counselorsHash).map(key => ({
    value: key,
    label: counselorsHash[key],
    checked: false,
  }));

/**
 * Reads the CaseOverview fields in definition version and returns an array of items (type Item[])
 * to be used as the options for the custom filter
 * @param definitionVersion DefinitionVersion
 * @param filterName The name of the filter to get values for
 * @returns Item[]
 */
export const getCustomFilterInitialValue = (definitionVersion: DefinitionVersion, filterName: string) => {
  if (!definitionVersion) return [];

  const customFilterField = Object.values(definitionVersion.caseOverview).find(
    field => field && typeof field === 'object' && (field as { name: string }).name === filterName,
  ) as { options?: Array<{ value: string; label: string }> } | undefined;

  if (!customFilterField?.options) return [];

  return customFilterField.options
    .filter(option => option && option.value !== '')
    .map(option => ({
      value: String(option.value),
      label: String(option.label),
      checked: false,
    }));
};

/**
 * Convert an array of items (type Item[]) into an array of strings.
 * This array will contain only the items that are checked.
 * @param items Item[]
 * @returns string[]
 */
export const filterCheckedItems = (items: Item[]): string[] =>
  items.filter(item => item.checked).map(item => item.value);
