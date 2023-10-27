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
import { Identifier, Profile, ProfileFlag } from '../states/profile/types';

type ProfileId = Profile['id'];
type ProfileFlagId = ProfileFlag['id'];

export const getIdentiferByIdentifier = (identifier: Identifier['identifier']) =>
  fetchHrmApi(`/profiles/identifier/${identifier}`);

export const getProfileById = (id: ProfileId) => fetchHrmApi(`/profiles/${id}`);

export const getProfileContacts = (id: ProfileId, offset: number, limit: number) =>
  fetchHrmApi(`/profiles/${id}/contacts?offset=${offset}&limit=${limit}`);

export const getProfileCases = (id: ProfileId, offset: number, limit: number) =>
  fetchHrmApi(`/profiles/${id}/cases?offset=${offset}&limit=${limit}`);

export const getProfileFlags = () => fetchHrmApi(`/profiles/profileFlags`);

export const associateProfileFlag = (profileId: ProfileId, profileFlagId: ProfileFlagId) =>
  fetchHrmApi(`/profiles/${profileId}/profileFlags/${profileFlagId}`, {
    method: 'POST',
  });

export const disassociateProfileFlag = (profileId: ProfileId, profileFlagId: ProfileFlagId) =>
  fetchHrmApi(`/profiles/${profileId}/profileFlags/${profileFlagId}`, {
    method: 'DELETE',
  });
