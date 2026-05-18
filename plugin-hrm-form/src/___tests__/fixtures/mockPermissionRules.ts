/**
 * Copyright (C) 2021-2025 Technology Matters
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

import { RulesFile } from '../../permissions/rules';

const mockRules: RulesFile = {
  viewCase: [['everyone']],
  closeCase: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
  reopenCase: [['isSupervisor']],
  caseStatusTransition: [],
  addCaseSection: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
  editCaseSection: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
  editCaseOverview: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
  updateCaseContacts: [['isSupervisor'], ['isCaseOpen']],

  viewContact: [['everyone']],
  editContact: [['isSupervisor'], ['isOwner']],
  editInProgressContact: [['isSupervisor'], ['isOwner']],
  viewExternalTranscript: [['isSupervisor']],
  viewRecording: [],
  addContactToCase: [['isSupervisor'], ['isOwner']],
  removeContactFromCase: [['isSupervisor'], ['isOwner']],

  viewProfile: [['everyone']],
  flagProfile: [],
  unflagProfile: [],
  createProfileSection: [],
  viewProfileSection: [],
  editProfileSection: [],

  viewPostSurvey: [['isSupervisor']],

  viewIdentifiers: [['everyone']],
};

export default mockRules;
