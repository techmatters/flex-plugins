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

import type { DefinitionVersion } from 'hrm-form-definitions';

// Action types
export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE';
export const POPULATE_COUNSELORS = 'POPULATE_COUNSELORS';
export const CHAT_CAPACITY_UPDATED = 'CHAT_CAPACITY_UPDATED';
export const POPULATE_CURRENT_DEFINITION_VERSION = 'POPULATE_CURRENT_DEFINITION_VERSION';
export const UPDATE_DEFINITION_VERSION = 'UPDATE_DEFINITION_VERSION';

export type CounselorsList = {
  sid: string;
  fullName: string;
}[];

type ChangeLanguageAction = {
  type: typeof CHANGE_LANGUAGE;
  language: string;
};

type PopulateCounselorsAction = {
  type: typeof POPULATE_COUNSELORS;
  counselorsList: CounselorsList;
};

type ChatCapacityUpdatedAction = {
  type: typeof CHAT_CAPACITY_UPDATED;
  capacity: number;
};

type PopulateCurrentDefinitionVersion = {
  type: typeof POPULATE_CURRENT_DEFINITION_VERSION;
  definitions: DefinitionVersion;
};

type UpdateDefinitionVersion = {
  type: typeof UPDATE_DEFINITION_VERSION;
  version: string;
  definitions: DefinitionVersion;
};

export type ConfigurationActionType =
  | ChangeLanguageAction
  | PopulateCounselorsAction
  | ChatCapacityUpdatedAction
  | PopulateCurrentDefinitionVersion
  | UpdateDefinitionVersion;
