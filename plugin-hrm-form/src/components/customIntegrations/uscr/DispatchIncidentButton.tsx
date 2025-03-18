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
import { useDispatch, useSelector } from 'react-redux';
import { Template, Notifications, NotificationType } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';

import { CheckCircleIcon } from './styles';
import customContactComponentRegistry from '../../forms/customContactComponentRegistry';
import type { RootState } from '../../../states';
import selectContactStateByContactId from '../../../states/contacts/selectContactStateByContactId';
import { useCase } from '../../../states/case/hooks/useCase';
import { useCaseSections } from '../../../states/case/hooks/useCaseSections';
import { updateContactInHrmAsyncAction } from '../../../states/contacts/saveContact';
import { isCaseSectionTimelineActivity } from '../../../states/case/types';
import { TertiaryButton, StyledNextStepButton } from '../../../styles';
import { dispatchAttemptSectionType, IncidentReportAttempt } from './dispatchAttempt';
import asyncDispatch from '../../../states/asyncDispatch';
import { newIncidentDispatchAction } from '../../../states/customIntegrations/uscrIncidentDispatch';

const dispatchSuccessNotification = 'dispatchSuccess';
const dispatchErrorNotification = 'dispatchError';

Notifications.registerNotification({
  id: dispatchSuccessNotification,
  closeButton: true,
  content: (
    <Template code="Dispatch request sent to Beacon. Any future edits to this contact will not be updated in Beacon" />
  ),
  timeout: 0,
  type: NotificationType.success,
});

Notifications.registerNotification({
  id: dispatchErrorNotification,
  closeButton: true,
  content: <Template code="Dispatch request failed, please try again" />,
  timeout: 0,
  type: NotificationType.error,
});

type OwnProps = {
  contactId: string;
};

type Props = OwnProps;

const DispatchIncidentButton: React.FC<Props> = ({ contactId }) => {
  const { trigger } = useFormContext();
  const dispatch = useDispatch();
  const asyncDispatcher = asyncDispatch(dispatch);

  // const dispatching = React.useRef(false);

  const {
    savedContact,
    draftContact,
    metadata: { loadingStatus },
  } = useSelector((state: RootState) => selectContactStateByContactId(state, contactId));
  const referenceId = React.useMemo(() => {
    const rand = Math.random();
    return `dispatch-incident-button-${savedContact.id}-${rand}`;
  }, [savedContact.id]);

  const { connectedCase, loading: caseLoading } = useCase({
    caseId: savedContact.caseId,
    referenceId,
  });
  const { sections } = useCaseSections({
    caseId: savedContact.caseId,
    sectionType: dispatchAttemptSectionType,
    autoload: true,
    refresh: true,
    paginationSettings: { limit: 100, offset: 0 },
  });

  // if no incident report exists in the case, we assume it doesn't have an incident
  const dispatchPending =
    !savedContact.caseId ||
    !sections.length ||
    !sections.some(
      t =>
        isCaseSectionTimelineActivity(t) &&
        (t.activity.sectionTypeSpecificData as IncidentReportAttempt).incidentId !== null,
    );

  const saveDraft = () => asyncDispatcher(updateContactInHrmAsyncAction(savedContact, draftContact, referenceId));

  const handleClickDispatch = async () => {
    try {
      const valid = await trigger();
      if (valid) {
        await saveDraft();
        // We use a regular dispatch here because we handle the error from where it is called.
        await dispatch(newIncidentDispatchAction(savedContact));
        Notifications.showNotificationSingle(dispatchSuccessNotification);
      }
    } catch (err) {
      console.error(err);
      Notifications.showNotificationSingle(dispatchErrorNotification);
    }
  };

  const loading = loadingStatus === 'loading' || caseLoading;

  return dispatchPending ? (
    <StyledNextStepButton
      type="button"
      onClick={handleClickDispatch}
      title="Dispatch Incident"
      disabled={loading}
      data-testid="dispatch-incident-button"
    >
      {loading && <CircularProgress size={12} />}
      <Template code="Dispatch Incident" />
    </StyledNextStepButton>
  ) : (
    <TertiaryButton
      type="button"
      onClick={() => console.log('>>>> clicked', savedContact, connectedCase)}
      title="Dispatch Incident"
      data-testid="dispatch-incident-button"
      disabled={true}
    >
      <CheckCircleIcon />
      &nbsp;
      <Template code="Incident Dispatched" />
    </TertiaryButton>
  );
};

DispatchIncidentButton.displayName = 'DispatchIncidentButton';

customContactComponentRegistry.register('uscr-dispatch-incident-button', parameters => {
  return <DispatchIncidentButton contactId={parameters.contactId} />;
});
