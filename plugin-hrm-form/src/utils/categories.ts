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

export const getCategoryColor = category => categories[category].color;
