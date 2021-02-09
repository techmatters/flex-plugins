import React from 'react';

import HrmTheme from '../styles/HrmTheme';
import { ContactTag, TagText, TagMiddleDot } from '../styles/search';
import { getFormsVersions } from '../HrmFormPlugin';

// TODO: support different versions here, as for example deleting a category will break this
const getCategoryColor = (category: string) => {
  const categories = getFormsVersions().currentDefinitionVersion.tabbedForms.IssueCategorizationTab;

  return categories[category] ? categories[category].color : HrmTheme.colors.defaultCategoryColor;
};

type ContactCategories = {
  [category: string]: string[];
};

const getCategoryLabel = (category, subcategory) =>
  subcategory === 'Unspecified/Other' ? `${subcategory} - ${category}` : subcategory;

export const getContactTags = (contactCategories: ContactCategories) =>
  Object.entries(contactCategories).flatMap(([category, subcategories]) =>
    subcategories.map(subcategory => ({
      label: getCategoryLabel(category, subcategory),
      color: getCategoryColor(category),
    })),
  );

// eslint-disable-next-line react/display-name
export const renderTag = (tag: string, color: string) => (
  <ContactTag color={color}>
    <TagMiddleDot color={color} />
    <TagText color={color}>{tag}</TagText>
  </ContactTag>
);
