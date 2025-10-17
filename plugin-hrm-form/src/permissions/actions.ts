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

export const CaseActions = {
  VIEW_CASE: 'viewCase',
  CLOSE_CASE: 'closeCase',
  REOPEN_CASE: 'reopenCase',
  CASE_STATUS_TRANSITION: 'caseStatusTransition',
  ADD_CASE_SECTION: 'addCaseSection',
  EDIT_CASE_SECTION: 'editCaseSection',
  EDIT_CASE_OVERVIEW: 'editCaseOverview',
  UPDATE_CASE_CONTACTS: 'updateCaseContacts',
} as const;

export const ContactActions = {
  VIEW_CONTACT: 'viewContact',
  EDIT_CONTACT: 'editContact',
  EDIT_IN_PROGRESS_CONTACT: 'editInProgressContact',
  VIEW_EXTERNAL_TRANSCRIPT: 'viewExternalTranscript',
  VIEW_RECORDING: 'viewRecording',
  ADD_CONTACT_TO_CASE: 'addContactToCase',
  REMOVE_CONTACT_FROM_CASE: 'removeContactFromCase',
} as const;

export const ProfileActions = {
  VIEW_PROFILE: 'viewProfile',
  // EDIT_PROFILE: 'editProfile', // we don't need edit for now, will be needed when users can attach more identifiers or edit the name
  FLAG_PROFILE: 'flagProfile',
  UNFLAG_PROFILE: 'unflagProfile',
};

export const ProfileSectionActions = {
  CREATE_PROFILE_SECTION: 'createProfileSection',
  VIEW_PROFILE_SECTION: 'viewProfileSection',
  EDIT_PROFILE_SECTION: 'editProfileSection',
};

export const ViewIdentifiersAction = {
  VIEW_IDENTIFIERS: 'viewIdentifiers',
} as const;

export const PermissionActions = {
  ...CaseActions,
  ...ContactActions,
  ...ProfileActions,
  ...ProfileSectionActions,
  ...ViewIdentifiersAction,
} as const;

export const actionsMaps = {
  case: CaseActions,
  contact: ContactActions,
  profile: ProfileActions,
  profileSection: ProfileSectionActions,
  postSurvey: {
    /* TODO: add when used */
  },
  viewIdentifiers: ViewIdentifiersAction,
} as const;

export type TargetKind = keyof typeof actionsMaps;
