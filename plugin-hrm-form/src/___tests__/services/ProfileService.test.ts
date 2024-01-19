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

import {
  getIdentifierByIdentifier,
  getProfileById,
  getProfileContacts,
  getProfileCases,
  getProfileFlags,
  associateProfileFlag,
  disassociateProfileFlag,
  getProfileSection,
  createProfileSection,
  updateProfileSection,
  getProfilesList,
} from '../../services/ProfileService';
import { fetchHrmApi } from '../../services/fetchHrmApi';

jest.mock('../../services/fetchHrmApi');
const mockFetchHrmAPi: jest.Mock = fetchHrmApi as jest.Mock;

beforeEach(() => {
  mockFetchHrmAPi.mockClear();
});

describe('getIdentifierByIdentifier()', () => {
  test('getIdentifierByIdentifier calls "GET /profiles/identifier', async () => {
    const identifier = '1234567890';

    await getIdentifierByIdentifier(identifier);

    const expectedUrl = `/profiles/identifier/${identifier}`;
    expect(fetchHrmApi).toHaveBeenCalledWith(expectedUrl);
  });
});

describe('getProfileById()', () => {
  test('calls "GET /profiles/{id}" with correct id', async () => {
    const id = 10;
    await getProfileById(id);
    expect(mockFetchHrmAPi).toHaveBeenCalledWith(`/profiles/${id}`);
  });
});

describe('getProfileContacts()', () => {
  test('calls "GET /profiles/{id}/contacts" with correct parameters', async () => {
    const id = 123;
    const offset = 10;
    const limit = 5;
    await getProfileContacts(id, offset, limit);
    expect(mockFetchHrmAPi).toHaveBeenCalledWith(`/profiles/${id}/contacts?offset=${offset}&limit=${limit}`);
  });
});

describe('getProfileCases()', () => {
  test('calls "GET /profiles/{id}/cases" with correct parameters', async () => {
    const id = 123;
    const offset = 0;
    const limit = 10;
    await getProfileCases(id, offset, limit);
    expect(mockFetchHrmAPi).toHaveBeenCalledWith(`/profiles/${id}/cases?offset=${offset}&limit=${limit}`);
  });
});

describe('getProfileFlags()', () => {
  test('calls "GET /profiles/flags"', async () => {
    await getProfileFlags();
    expect(mockFetchHrmAPi).toHaveBeenCalledWith(`/profiles/flags`);
  });
});

describe('associateProfileFlag()', () => {
  test('calls "POST /profiles/{profileId}/flags/{profileFlagId}" with correct parameters', async () => {
    const profileId = 23;
    const profileFlagId = 1;
    await associateProfileFlag(profileId, profileFlagId);
    expect(mockFetchHrmAPi).toHaveBeenCalledWith(`/profiles/${profileId}/flags/${profileFlagId}`, expect.any(Object));
  });
  test('calls "POST /profiles/{profileId}/flags/{profileFlagId}" with correct parameters', async () => {
    const profileId = 23;
    const profileFlagId = 1;
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 1);
    await associateProfileFlag(profileId, profileFlagId, validUntilDate);

    expect(mockFetchHrmAPi).toHaveBeenCalledWith(
      `/profiles/23/flags/1`,
      expect.objectContaining({
        body: expect.stringMatching(/{"validUntil":".*"}/),
        method: 'POST',
      }),
    );
  });
});

describe('disassociateProfileFlag()', () => {
  test('calls "DELETE /profiles/{profileId}/flags/{profileFlagId}" with correct parameters', async () => {
    const profileId = 23;
    const profileFlagId = 1;
    await disassociateProfileFlag(profileId, profileFlagId);
    expect(mockFetchHrmAPi).toHaveBeenCalledWith(`/profiles/${profileId}/flags/${profileFlagId}`, expect.any(Object));
  });
});

describe('getProfileSection()', () => {
  test('calls "GET /profiles/{profileId}/sections/{sectionId}" with correct parameters', async () => {
    const profileId = 1;
    const sectionId = 2;
    await getProfileSection(profileId, sectionId);
    expect(mockFetchHrmAPi).toHaveBeenCalledWith(`/profiles/${profileId}/sections/${sectionId}`);
  });
});

describe('createProfileSection()', () => {
  test('calls "POST /profiles/{profileId}/sections" with correct parameters', async () => {
    const profileId = 23;
    const content = 'Test Content';
    const sectionType = 'Type';
    await createProfileSection(profileId, content, sectionType);
    expect(mockFetchHrmAPi).toHaveBeenCalledWith(`/profiles/${profileId}/sections`, expect.any(Object));
  });
});

describe('updateProfileSection()', () => {
  test('calls "PATCH /profiles/{profileId}/sections/{sectionId}" with correct parameters', async () => {
    const profileId = 23;
    const sectionId = 2;
    const content = 'Updated Content';
    await updateProfileSection(profileId, sectionId, content);
    expect(mockFetchHrmAPi).toHaveBeenCalledWith(`/profiles/${profileId}/sections/${sectionId}`, expect.any(Object));
  });
});

describe('getProfilesList()', () => {
  test('calls "GET /profiles" with default parameters', async () => {
    await getProfilesList();
    expect(mockFetchHrmAPi).toHaveBeenCalledWith(`/profiles?offset=0&limit=10&sortBy=id`);
  });

  test('calls "GET /profiles" with custom parameters', async () => {
    const offset = 20;
    const limit = 5;
    const sortBy = 'id';
    const sortDirection = 'asc';
    const profileFlagIds = [1, 2];
    await getProfilesList({
      offset,
      limit,
      sortBy,
      sortDirection,
      profileFlagIds,
    });
    expect(decodeURIComponent(mockFetchHrmAPi.mock.calls[0][0])).toEqual(
      `/profiles?offset=${offset}&limit=${limit}&sortBy=${sortBy}&sortDirection=${sortDirection}&profileFlagIds=${profileFlagIds.join(
        ',',
      )}`,
    );
  });
});
