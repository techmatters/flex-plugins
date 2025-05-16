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

import type { DefinitionVersion } from '@tech-matters/hrm-form-definitions';

import * as t from './types';

// Action creators
export const changeLanguage = (language: string): t.ConfigurationActionType => ({ type: t.CHANGE_LANGUAGE, language });

export const populateCounselorsState = (counselorsList: t.CounselorsList): t.ConfigurationActionType => ({
  type: t.POPULATE_COUNSELORS,
  counselorsList,
});

export const chatCapacityUpdated = (capacity: number): t.ConfigurationActionType => ({
  type: t.CHAT_CAPACITY_UPDATED,
  capacity,
});

export const populateCurrentDefinitionVersion = (definitions: DefinitionVersion): t.ConfigurationActionType => ({
  type: t.POPULATE_CURRENT_DEFINITION_VERSION,
  definitions,
});

export const updateDefinitionVersion = (
  version: string,
  definitions: DefinitionVersion,
): t.ConfigurationActionType => ({
  type: t.UPDATE_DEFINITION_VERSION,
  version,
  definitions,
});
