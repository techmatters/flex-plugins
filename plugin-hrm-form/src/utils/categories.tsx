import React from 'react';
import HrmTheme from '../styles/HrmTheme';
import IssueCategorizationTabDefinition from '../formDefinitions/tabbedForms/IssueCategorizationTab.json';
import type { CategoriesDefinition } from '../components/common/forms/types';
import { ContactTag, TagText, TagMiddleDot } from '../styles/search';

const categories = IssueCategorizationTabDefinition as CategoriesDefinition;

const getCategoryColor = category =>
  categories[category] ? categories[category].color : HrmTheme.colors.defaultCategoryColor;

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

export const renderTag = (tag: string, color: string) => (
  <ContactTag color={color}>
    <TagMiddleDot color={color} />
    <TagText color={color}>{tag}</TagText>
  </ContactTag>
);