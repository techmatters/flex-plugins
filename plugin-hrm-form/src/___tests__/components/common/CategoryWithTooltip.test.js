import { getTag } from '../../../components/common/CategoryWithTooltip';

describe('Test getTag with various lengths', () => {
  test('length =< 17', async () => {
    const category1 = 'category1';
    const category2 = 'category longer';
    const category3 = 'category looonger';

    expect(getTag(category1)).toBe(category1);
    expect(getTag(category2)).toBe(category2);
    expect(getTag(category3)).toBe(category3);
  });

  test('length > 17', async () => {
    const category1 = 'category1 very long';
    const category2 = 'category2 with       spaces everywhere';
    const category3 = 'UNSPECIFIED/OTHER - and some various thigs more';

    expect(getTag(category1)).toBe('category1 very...');
    expect(getTag(category2)).toBe('category2 with...');
    expect(getTag(category3)).toBe('UNSPECIFIED/OTHER');
  });
});
