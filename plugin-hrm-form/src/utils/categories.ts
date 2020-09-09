type CategoriesColor = {
  [category: string]: {
    color: string;
  };
};

const categories: CategoriesColor = {
  'Missing children': {
    color: '#BBE3FF',
  },
  Violence: {
    color: '#F5A623',
  },
  'Mental Health': {
    color: '#F8E900',
  },
  'Physical Health': {
    color: '#E86B6B',
  },
  Accessibility: {
    color: '#8055BA',
  },
  'Discrimination and Exclusion': {
    color: '#B971AF',
  },
  'Family Relationships': {
    color: '#239613',
  },
  'Peer Relationships': {
    color: '#9AD703',
  },
  School: {
    color: '#55AFAF',
  },
  Sexuality: {
    color: '#506BA5',
  },
  'Information & Other Non-Counselling contacts': {
    color: '#767777',
  },
};

const defaultColor = '#000';

export const getCategoryColor = category => (categories[category] ? categories[category].color : defaultColor);

type ContactCategories = {
  [category: string]: string[];
};

const getCategoryLabel = (category, subcategory) =>
  subcategory === 'Unspecified/Other' ? `${subcategory} - ${category}` : subcategory;

export const getContactTags = (contactCategories: ContactCategories) =>
  Object.entries(contactCategories).map(([category, [subcategory]]) => ({
    label: getCategoryLabel(category, subcategory),
    color: getCategoryColor(category),
  }));
