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

import { fetchHrmApi } from './fetchHrmApi';
import { Identifier, Profile, ProfileFlag, ProfileSection } from '../states/profile/types';

type ProfileId = Profile['id'];
type ProfileFlagId = ProfileFlag['id'];
type ProfileSectionId = ProfileSection['id'];

export const getIdentifierByIdentifier = (identifier: Identifier['identifier']) =>
  fetchHrmApi(`/profiles/identifier/${identifier}`);

export const getProfileById = (id: ProfileId) => fetchHrmApi(`/profiles/${id}`);

export const getProfileContacts = (id: ProfileId, offset: number, limit: number) =>
  fetchHrmApi(`/profiles/${id}/contacts?offset=${offset}&limit=${limit}`);

export const getProfileCases = (id: ProfileId, offset: number, limit: number) =>
  fetchHrmApi(`/profiles/${id}/cases?offset=${offset}&limit=${limit}`);

export const getProfileFlags = () => {
  return fetchHrmApi(`/profiles/flags`).then(response => {
    return response;
  });
};

export const associateProfileFlag = (profileId: ProfileId, profileFlagId: ProfileFlagId) =>
  fetchHrmApi(`/profiles/${profileId}/flags/${profileFlagId}`, {
    method: 'POST',
  });

export const disassociateProfileFlag = (profileId: ProfileId, profileFlagId: ProfileFlagId) =>
  fetchHrmApi(`/profiles/${profileId}/flags/${profileFlagId}`, {
    method: 'DELETE',
  });

export const getProfileSection = (profileId: ProfileId, sectionId: ProfileSectionId) =>
  fetchHrmApi(`/profiles/${profileId}/sections/${sectionId}`);

export const createProfileSection = (profileId: ProfileId, content: string, sectionType: string) =>
  fetchHrmApi(`/profiles/${profileId}/sections`, {
    method: 'POST',
    body: JSON.stringify({ content, sectionType }),
  });

export const updateProfileSection = (profileId: ProfileId, sectionId: ProfileSectionId, content: string) => {
  return fetchHrmApi(`/profiles/${profileId}/sections/${sectionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
};

export const getProfileList = (
  offset: number = 1,
  limit: number = 10,
  sortBy: string | number = 'id', // id or name
  sortDirection: string = null,
  profileFlagIds: string = null,
) =>
  fetchHrmApi(
    `/profiles?offset=${offset}&limit=${limit}&sortBy=${sortBy}&sortDirection=${sortDirection}&profileFlagIds=${profileFlagIds}`,
  );
