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

import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import InfoIcon from './InfoIcon';
import asyncDispatch from '../../states/asyncDispatch';
import { removeFromCaseAsyncAction } from '../../states/contacts/saveContact';
import { newGoBackAction } from '../../states/routing/actions';
import getOfflineContactTaskSid from '../../states/contacts/offlineContactTaskSid';
import { cancelCaseAsyncAction } from '../../states/case/saveCase';
import selectCaseStateByCaseId from '../../states/case/selectCaseStateByCaseId';
import { showRemovedFromCaseBannerAction } from '../../states/case/caseBanners';
import { CustomITask, StandaloneITask } from '../../types/types';
import { BannerActionLink, BannerContainer, Text } from '../../styles/banners';

type OwnProps = {
  task?: CustomITask | StandaloneITask;
  caseId: string;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const mapStateToProps = (state, { task, caseId }: OwnProps) => {
  const taskSid = task ? task.taskSid : getOfflineContactTaskSid();
  const cas = selectCaseStateByCaseId(state, caseId)?.connectedCase;
  return {
    cas,
    taskSid,
  };
};

const mapDispatchToProps = dispatch => ({
  removeContactFromCase: async (contactId: string) => asyncDispatch(dispatch)(removeFromCaseAsyncAction(contactId)),
  cancelCase: async (caseId: string) => asyncDispatch(dispatch)(cancelCaseAsyncAction(caseId)),
  showRemovedFromCaseBanner: (contactId: string) => dispatch(showRemovedFromCaseBannerAction(contactId)),
  navigateBack: (taskSid: string) => dispatch(newGoBackAction(taskSid)),
});

const CreatedCaseBanner: React.FC<Props> = ({
  taskSid,
  caseId,
  cas,
  removeContactFromCase,
  cancelCase,
  showRemovedFromCaseBanner,
  navigateBack,
}) => {
  const handleCancelCase = async () => {
    const contactIds = cas.connectedContacts.map(c => c.id);
    await Promise.all(contactIds.map(id => removeContactFromCase(id)));

    // Navigating back before removing the case provides a better user experience.
    navigateBack(taskSid);
    contactIds.forEach(id => showRemovedFromCaseBanner(id));
    await cancelCase(caseId);
  };

  return (
    <BannerContainer color="blue">
      <InfoIcon color="#001489" />
      <Text>
        <Template code="CaseMerging-CaseCreatedAndContactAdded" caseId={caseId} />
      </Text>
      <BannerActionLink type="button" onClick={handleCancelCase}>
        <Template code="CaseMerging-CancelCase" />
      </BannerActionLink>
    </BannerContainer>
  );
};

CreatedCaseBanner.displayName = 'CreatedCaseBanner';

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CreatedCaseBanner);
