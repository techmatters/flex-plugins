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

import { loadV2Translations } from '../translations/localizationHelpers';
import { getHrmConfig } from '../hrmConfig';

jest.mock('../hrmConfig', () => ({
  getHrmConfig: jest.fn(),
}));

describe('loadV2Translations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getHrmConfig as jest.Mock).mockReturnValue({ helpline: 'br' });
  });

  it('should load base language translations', async () => {
    const result = await loadV2Translations('en-US');
    expect(result).toHaveProperty('CancelButton');
  });

  it('should merge locale overrides correctly', async () => {
    const result = await loadV2Translations('pt-BR');
    expect(result).toHaveProperty('CancelButton');
  });

  it('should merge helpline overrides correctly', async () => {
    const result = await loadV2Translations('en-US');
    expect(result).toHaveProperty('CancelButton');
  });

  it('should handle missing locale overrides gracefully', async () => {
    const result = await loadV2Translations('en-INVALID');
    expect(result).toHaveProperty('CancelButton');
  });

  it('should handle missing helpline overrides gracefully', async () => {
    (getHrmConfig as jest.Mock).mockReturnValue({ helpline: 'invalid' });
    const result = await loadV2Translations('en-US');
    expect(result).toHaveProperty('CancelButton');
  });

  it('should handle missing base language gracefully', async () => {
    const result = await loadV2Translations('invalid-INVALID');
    expect(result).toBeNull();
  });

  it('should merge translations in correct order (base -> locale -> helpline)', async () => {
    // Mock translations with overlapping keys
    jest.mock('../translations/1baseLanguage/en.json', () => ({
      key1: 'base',
      key2: 'base',
      key3: 'base',
    }));
    jest.mock('../translations/2localeOverrides/en-US.json', () => ({
      key2: 'locale',
      key3: 'locale',
    }));
    jest.mock('../translations/3helplineOverrides/br.json', () => ({
      key3: 'helpline',
    }));

    const result = await loadV2Translations('en-US');
    expect(result).toMatchObject({
      key1: 'base',
      key2: 'locale',
      key3: 'helpline',
    });
  });
});
