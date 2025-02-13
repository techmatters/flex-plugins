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
import { Template } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';

import { TransferStyledButton } from '../../../styles';
import { newGenerateSummaryAsyncAction } from '../../../states/contacts/llmAssistant';
import { RootState } from '../../../states';
import selectContactStateByContactId from '../../../states/contacts/selectContactStateByContactId';
import { getAseloFeatureFlags } from '../../../hrmConfig';
import { ContactState } from '../../../states/contacts/existingContacts';
import { LoadingStatus } from '../../../states/contacts/types';
import customContactComponentRegistry from '../../forms/customContactComponentRegistry';
import { isOfflineContact } from '../../../types/types';

type Props = {
  contactId: string;
  form: string;
  item: string;
};

const GenerateSummaryButton: React.FC<Props> = ({ contactId, form, item }) => {
  const dispatch = useDispatch();
  const { savedContact: contact, metadata } = useSelector(
    (state: RootState) => selectContactStateByContactId(state, contactId) ?? ({} as ContactState),
  );

  if (
    !getAseloFeatureFlags().enable_llm_summary ||
    !contact ||
    isOfflineContact(contact) ||
    !contact.taskId ||
    contact.finalizedAt
  ) {
    return null;
  }
  const loading = metadata?.loadingStatus === LoadingStatus.LOADING;
  const alreadySummarized = (contact.rawJson.aiSupportedEntries?.[form] ?? []).includes(item);

  return (
    <TransferStyledButton
      disabled={alreadySummarized || loading}
      onClick={() => dispatch(newGenerateSummaryAsyncAction(contact, form, item))}
    >
      <Template code={loading ? 'ContactForms-TextArea-LoadingSummary' : 'ContactForms-TextArea-GenerateSummary'} />
    </TransferStyledButton>
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
