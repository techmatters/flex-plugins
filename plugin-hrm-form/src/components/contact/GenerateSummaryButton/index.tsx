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
import * as React from 'react';
import { Notifications, Template } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import { useEffect } from 'react';

import { TertiaryButton } from '../../../styles';
import { newGenerateSummaryAsyncAction } from '../../../states/contacts/llmAssistant';
import { RootState } from '../../../states';
import selectContactStateByContactId from '../../../states/contacts/selectContactStateByContactId';
import { getAseloFeatureFlags } from '../../../hrmConfig';
import { ContactState } from '../../../states/contacts/existingContacts';
import { LlmAssistantStatus } from '../../../states/contacts/types';
import customContactComponentRegistry from '../../forms/customContactComponentRegistry';
import { isOfflineContact } from '../../../types/types';
import GenerateSummaryIcon from './GenerateSummaryIcon';
import { LlmNotifications } from './setUpLlmNotifications';
import asyncDispatch from '../../../states/asyncDispatch';

type Props = {
  contactId: string;
  form: string;
  item: string;
};

const GenerateSummaryButton: React.FC<Props> = ({ contactId, form, item }) => {
  const asyncDispatcher = asyncDispatch(useDispatch());
  const metadata = useSelector(
    (state: RootState) => (selectContactStateByContactId(state, contactId) ?? ({} as ContactState)).metadata,
  );
  const draftContact = useSelector(
    (state: RootState) => (selectContactStateByContactId(state, contactId) ?? ({} as ContactState)).draftContact,
  );
  const savedContact = useSelector(
    (state: RootState) => (selectContactStateByContactId(state, contactId) ?? ({} as ContactState)).savedContact,
  );

  const { status: llmAssistantStatus, lastError: llmAssistantError } = metadata?.llmAssistant ?? {};

  useEffect(() => {
    if (llmAssistantStatus === LlmAssistantStatus.ERROR) {
      Notifications.showNotification(LlmNotifications.SummaryGenerationErrorNotification, { error: llmAssistantError });
    }
  }, [llmAssistantStatus, llmAssistantError]);

  if (
    !getAseloFeatureFlags().enable_llm_summary ||
    !savedContact ||
    isOfflineContact(savedContact) ||
    !savedContact.taskId ||
    !savedContact.channelSid ||
    savedContact.finalizedAt
  ) {
    return null;
  }
  const assistantWorking = metadata?.llmAssistant.status === LlmAssistantStatus.WORKING;
  const llmSupportedEntries =
    draftContact?.rawJson?.llmSupportedEntries ?? savedContact.rawJson.llmSupportedEntries ?? {};
  const alreadySummarized = (llmSupportedEntries[form] ?? []).includes(item);

  return (
    <TertiaryButton
      disabled={assistantWorking || alreadySummarized}
      onClick={() => asyncDispatcher(newGenerateSummaryAsyncAction(savedContact, form, item))}
      style={{}}
    >
      {assistantWorking ? (
        <>
          <CircularProgress size={12} style={{ marginRight: '8px' }} />
          <span style={{ minWidth: '80px' }}>
            <Template code="ContactForms-TextArea-LoadingSummary" />
          </span>
        </>
      ) : (
        <>
          <span style={{ marginRight: '8px', marginTop: '2px' }}>
            <GenerateSummaryIcon width="14" height="14" />
          </span>

          <span style={{ minWidth: '80px' }}>
            <Template code="ContactForms-TextArea-GenerateSummary" />
          </span>
        </>
      )}
    </TertiaryButton>
  );
};

customContactComponentRegistry.register('generate-summary-button', parameters => {
  return (
    <GenerateSummaryButton
      contactId={parameters.contactId}
      form={parameters.props.form.toString()}
      item={parameters.props.item.toString()}
    />
  );
});
