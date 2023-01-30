import HrmTheme from '../styles/HrmTheme';
import { getConfig, getDefinitionVersions } from '../HrmFormPlugin';
import { ContactRawJson } from '../types/types';

const getCategoryColor = (definitionVersion: ContactRawJson['definitionVersion'], category: string) => {
  const { helpline } = getConfig();

  const categories =
    getDefinitionVersions().definitionVersions[definitionVersion]?.tabbedForms.IssueCategorizationTab(helpline) ?? {};

  return categories[category] ? categories[category].color : HrmTheme.colors.defaultCategoryColor;
};

type ContactCategories = {
  [category: string]: string[];
};

const getCategoryLabel = (category, subcategory) =>
  subcategory === 'Unspecified/Other' ? `${subcategory} - ${category}` : subcategory;

export const getContactTags = (
  definitionVersion: ContactRawJson['definitionVersion'],
  contactCategories: ContactCategories,
) =>
  Object.entries(contactCategories).flatMap(([category, subcategories]) =>
    subcategories.map(subcategory => ({
      label: getCategoryLabel(category, subcategory),
      color: getCategoryColor(definitionVersion, category),
    })),
  );
