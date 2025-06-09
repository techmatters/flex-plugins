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
import { TaskHelper } from '@twilio/flex-ui';

import { ContactMetadata, LlmAssistantStatus, LoadingStatus } from './types';
import { ReferralLookupStatus } from './resourceReferral';
import type { ContactState } from './existingContacts';
import { Contact, ContactRawJson, isOfflineContactTask, OfflineContactTask } from '../../types/types';
import { createContactlessTaskTabDefinition } from '../../components/tabbedForms/ContactlessTaskTabDefinition';
import { getHrmConfig } from '../../hrmConfig';
import { createStateItem, getInitialValue } from '../../components/common/forms/formValues';

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
    loadingStatus: LoadingStatus.LOADED,
    llmAssistant: {
      status: LlmAssistantStatus.READY,
    },
  };
};

export const newContact = (definitions: DefinitionVersion, task?: ITask | OfflineContactTask): Contact => {
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
    createdOnBehalfOf: null,
    ...Object.fromEntries(initialContactlessTaskTabDefinition.map(d => [d.name, getInitialValue(d)])),
  };
  const channel = (task?.channelType ?? 'default') as Contact['channel'];
  const chatSids =
    task && !isOfflineContactTask(task) && TaskHelper.isChatBasedTask(task)
      ? {
          channelSid: task.attributes.channelSid ?? '',
          serviceSid: getHrmConfig()?.chatServiceSid ?? '',
        }
      : { channelSid: '', serviceSid: '' };

  return {
    accountSid: null,
    id: '',
    definitionVersion: '',
    twilioWorkerId: null,
    timeOfContact: new Date().toISOString(),
    taskId: null,
    helpline: '',
    rawJson: {
      childInformation: initialChildInformation,
      callerInformation: initialCallerInformation,
      caseInformation: initialCaseInformation,
      callType: '',
      contactlessTask,
      categories: {},
    },
    ...chatSids,
    channel,
    createdBy: '',
    createdAt: '',
    updatedBy: '',
    updatedAt: '',
    queueName: '',
    number: '',
    conversationDuration: 0,
    identifierId: null,
    profileId: null,
    csamReports: [],
    conversationMedia: [],
  };
};

// eslint-disable-next-line import/no-unused-modules
export const newContactState = (definitions: DefinitionVersion, task?: ITask | OfflineContactTask) => (
  recreated: boolean,
): ContactState => ({
  savedContact: newContact(definitions, task),
  metadata: newContactMetaData(recreated),
  draftContact: {},
  references: new Set(),
});
