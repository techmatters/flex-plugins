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

import { fetchHrmApi } from '../../services/fetchHrmApi';
import { ApiCaseSection, createCaseSection, updateCaseSection } from '../../services/caseSectionService';

jest.mock('../../services/fetchHrmApi');
const mockFetchHrmAPi: jest.Mock = fetchHrmApi as jest.Mock;

const jsonStringToParseAs = (actual: string, expected: any) => {
  try {
    const parsed = JSON.parse(actual);
    expect(parsed).toStrictEqual(expected);
  } catch (err) {
    return { pass: false, message: () => err.message() };
  }
  return { pass: true, message: () => 'JSON string parses as expected object' };
};

declare global {
  namespace jest {
    interface Matchers<R> {
      jsonStringToParseAs(expected: any): R;
    }
    // @ts-ignore
    interface Expect<R> {
      jsonStringToParseAs(expected: any): R;
    }
  }
}

expect.extend({ jsonStringToParseAs });

beforeEach(() => {
  mockFetchHrmAPi.mockClear();
});

const response: ApiCaseSection = {
  sectionTypeSpecificData: {
    some: 'stuff',
  },
  sectionId: 'section-123',
  createdAt: '2000-01-01T00:00:00.000Z',
  twilioWorkerId: 'WK-creating',
};

test('createCaseSection - Generates a POST HTTP call via fetchHrmApi', async () => {
  mockFetchHrmAPi.mockResolvedValue(response);
  const created = await createCaseSection('case-123', 'note', { some: 'stuff' });

  const expectedUrl = `/cases/case-123/sections/note`;
  const expectedOptions = {
    method: 'POST',
    body: expect.jsonStringToParseAs({ sectionTypeSpecificData: { some: 'stuff' } }),
  };
  expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl, expectedOptions);
  expect(created).toStrictEqual(response);
});

test('updateCaseSection - Generates a POST HTTP call via fetchHrmApi', async () => {
  mockFetchHrmAPi.mockResolvedValue(response);
  const created = await updateCaseSection('case-123', 'note', 'note-123', { some: 'stuff' });

  const expectedUrl = `/cases/case-123/sections/note/note-123`;
  const expectedOptions = {
    method: 'PUT',
    body: expect.jsonStringToParseAs({ sectionTypeSpecificData: { some: 'stuff' } }),
  };
  expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl, expectedOptions);
  expect(created).toStrictEqual(response);
});
