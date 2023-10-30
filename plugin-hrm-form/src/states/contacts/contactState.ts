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

import type { ContactMetadata } from './types';
import { ReferralLookupStatus } from './resourceReferral';
import type { ContactState } from './existingContacts';
import type { Contact, ContactRawJson } from '../../types/types';
import { createStateItem, getInitialValue } from '../../components/common/forms/formGenerators';
import { createContactlessTaskTabDefinition } from '../../components/tabbedForms/ContactlessTaskTabDefinition';

export const newContactMetaData = (recreated: boolean): ContactMetadata => {
  const categoriesMeta = {
    gridView: false,
    expanded: {},
  };

  return {
    draft: {
      resourceReferralList: {
        resourceReferralIdToAdd: '',
        lookupStatus: ReferralLookupStatus.NOT_STARTED,
      },
      dialogsOpen: {},
    },
    startMillis: recreated ? null : new Date().getTime(),
    endMillis: null,
    recreated,
    categories: categoriesMeta,
  };
};
export const newContact = (definitions: DefinitionVersion): Contact => {
  const initialChildInformation = definitions.tabbedForms.ChildInformationTab.reduce(createStateItem, {});
  const initialCallerInformation = definitions.tabbedForms.CallerInformationTab.reduce(createStateItem, {});
  const initialCaseInformation = definitions.tabbedForms.CaseInformationTab.reduce(createStateItem, {});

  const { helplines } = definitions.helplineInformation;
  const defaultHelpline = helplines.find(helpline => helpline.default).value || helplines[0].value;
  if (defaultHelpline === null || defaultHelpline === undefined) throw new Error('No helpline definition was found');

  const initialContactlessTaskTabDefinition = createContactlessTaskTabDefinition({
    counselorsList: [],
    definition: definitions.tabbedForms.ContactlessTaskTab,
    helplineInformation: definitions.helplineInformation,
  });
  const contactlessTask: ContactRawJson['contactlessTask'] = {
    channel: 'web', // default, should be overwritten
    date: new Date().toISOString(),
    time: new Date().toTimeString(),
    createdOnBehalfOf: '',
    ...Object.fromEntries(initialContactlessTaskTabDefinition.map(d => [d.name, getInitialValue(d)])),
  };

  return {
    accountSid: '',
    id: '',
    twilioWorkerId: '',
    timeOfContact: new Date().toISOString(),
    taskId: '',
    helpline: '',
    rawJson: {
      childInformation: initialChildInformation,
      callerInformation: initialCallerInformation,
      caseInformation: initialCaseInformation,
      callType: '',
      contactlessTask,
      categories: {},
    },
    createdBy: '',
    createdAt: '',
    updatedBy: '',
    updatedAt: '',
    queueName: '',
    channel: 'web',
    number: '',
    conversationDuration: 0,
    channelSid: '',
    serviceSid: '',
    csamReports: [],
    conversationMedia: [],
  };
};
// eslint-disable-next-line import/no-unused-modules
export const newContactState = (definitions: DefinitionVersion) => (recreated: boolean): ContactState => ({
  savedContact: newContact(definitions),
  metadata: newContactMetaData(recreated),
  draftContact: {},
  references: new Set(),
});
