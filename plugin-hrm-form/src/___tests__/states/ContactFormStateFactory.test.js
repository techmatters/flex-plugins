import { isNotCategory, isNotSubcategory } from '../../states/ContactFormStateFactory';

describe('isNotCategory', () => {
  test('returns true', () => {
    expect(isNotCategory('error')).toBe(true);
    expect(isNotCategory('touched')).toBe(true);
    expect(isNotCategory('type')).toBe(true);
    expect(isNotCategory('validation')).toBe(true);
  });

  test('returns false', () => {
    expect(isNotCategory('Missing children')).toBe(false);
    expect(isNotCategory('Violence')).toBe(false);
    expect(isNotCategory('Mental Health')).toBe(false);
  });
});

describe('isNotSubcategory', () => {
  test('returns true', () => {
    expect(isNotSubcategory('type')).toBe(true);
  });

  test('returns false', () => {
    expect(isNotSubcategory('Child abduction')).toBe(false);
    expect(isNotSubcategory('Bullying')).toBe(false);
    expect(isNotSubcategory('Addictive behaviours')).toBe(false);
  });
});
