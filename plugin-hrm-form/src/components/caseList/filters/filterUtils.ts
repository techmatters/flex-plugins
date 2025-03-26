import type { DefinitionVersion } from 'hrm-form-definitions';

import { dateFilterOptionsInPast, dateFilterOptionsInPastAndFuture, DateFilter } from './dateFilters';
import { CategoryFilter, CounselorHash } from '../../../types/types';
import { Category } from './CategoriesFilter';
import { Item } from './MultiSelectFilter';

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

export const getInitialDateFilters = (caseInfoFilters?: Record<string, any>): DateFilter[] => {
  const standardFilters = [
    {
      labelKey: 'CaseList-Filters-DateFilter-CreatedAt',
      filterPayloadParameter: 'createdAt',
      options: dateFilterOptionsInPast(),
    },
    {
      labelKey: 'CaseList-Filters-DateFilter-UpdatedAt',
      filterPayloadParameter: 'updatedAt',
      options: dateFilterOptionsInPast(),
    },
  ];

  const customDateFilters: DateFilter[] = [];

  if (caseInfoFilters) {
    Object.keys(caseInfoFilters).forEach(filterName => {
      if (filterName === 'createdAt' || filterName === 'updatedAt') {
        return;
      }

      const filterConfig = caseInfoFilters[filterName];
      if (filterConfig?.type === 'date-input') {
        customDateFilters.push({
          labelKey: filterConfig.label || filterName,
          filterPayloadParameter: filterName,
          options: filterConfig.allowFutureDates ? dateFilterOptionsInPastAndFuture(filterConfig.label || filterName) : dateFilterOptionsInPast(),
        });
      }
    });
  }

  return [...standardFilters, ...customDateFilters];
};

/**
 * Reads the definition version and returns and array of categories (type Category[])
 * to be used as the options for the categories filter
 */
export const getCategoriesInitialValue = (definitionVersion: DefinitionVersion, helpline: string) =>
  definitionVersion
    ? Object.entries(definitionVersion.tabbedForms.IssueCategorizationTab(helpline)).map(
        ([categoryName, { subcategories }]) => ({
          categoryName,
          subcategories: subcategories.map(subcategory => ({
            value: subcategory.label,
            label: subcategory.label,
            checked: false,
          })),
        }),
      )
    : [];

/**
 * Convert an array of items (type Item[]) into an array of strings.
 * This array will contain only the items that are checked.
 * @param items Item[]
 * @returns string[]
 */
export const filterCheckedItems = (items: Item[]): string[] =>
  items.filter(item => item.checked).map(item => item.value);

/**
 * Convert an array of categories (type Category[]) into an array of CategoryFilter.
 * This array will contain only the categories that are checked.
 * @param categories Category[]
 * @returns CategoryFilter[]
 */
export const filterCheckedCategories = (categories: Category[]): CategoryFilter[] =>
  categories.flatMap(category =>
    category.subcategories
      .filter(subcategory => subcategory.checked)
      .map(subcategory => ({
        category: category.categoryName,
        subcategory: subcategory.label,
      })),
  );

/**
 * Given the selected categories from redux and the previous categoriesValues,
 * it returns the updated values for categoriesValues, whith the correct checked values.
 *
 * @param categories Selected categories from redux (type CategoryFilter[])
 * @param categoriesValues Previous categoriesValues (type Category[])
 * @returns
 */
export const getUpdatedCategoriesValues = (categories: CategoryFilter[], categoriesValues: Category[]): Category[] => {
  const isChecked = (categoryName: string, subcategoryName: string) =>
    categories.some(c => c.category === categoryName && c.subcategory === subcategoryName);

  return categoriesValues.map(categoryValue => ({
    ...categoryValue,
    subcategories: categoryValue.subcategories.map(subcategory => ({
      ...subcategory,
      checked: isChecked(categoryValue.categoryName, subcategory.label),
    })),
  }));
};
