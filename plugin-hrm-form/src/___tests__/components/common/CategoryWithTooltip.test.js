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
