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
import { getOfflineContactTaskSid } from '../../states/contacts/offlineContactTask';
import { cancelCaseAsyncAction } from '../../states/case/saveCase';
import { showRemovedFromCaseBannerAction } from '../../states/case/caseBanners';
import { CustomITask, StandaloneITask } from '../../types/types';
import { BannerActionLink, BannerContainer, Text } from '../../styles/banners';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';

type OwnProps = {
  task?: CustomITask | StandaloneITask;
  caseId: string;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const mapStateToProps = (state, { task }: OwnProps) => {
  const taskSid = task ? task.taskSid : getOfflineContactTaskSid();
  const taskContact = selectContactByTaskSid(state, taskSid)?.savedContact;
  return {
    taskContact,
  };
};

const mapDispatchToProps = dispatch => ({
  removeContactFromCase: async (contactId: string) => asyncDispatch(dispatch)(removeFromCaseAsyncAction(contactId)),
  cancelCase: async (caseId: string) => asyncDispatch(dispatch)(cancelCaseAsyncAction(caseId)),
  showRemovedFromCaseBanner: (contactId: string) => dispatch(showRemovedFromCaseBannerAction(contactId)),
  navigateBack: (taskSid: string) => dispatch(newGoBackAction(taskSid)),
});

const CreatedCaseBanner: React.FC<Props> = ({
  task: { taskSid },
  caseId,
  taskContact,
  removeContactFromCase,
  cancelCase,
  showRemovedFromCaseBanner,
  navigateBack,
}) => {
  const handleCancelCase = async () => {
    await removeContactFromCase(taskContact?.id);

    // Navigating back before removing the case provides a better user experience.
    navigateBack(taskSid);
    showRemovedFromCaseBanner(taskContact?.id);
    await cancelCase(caseId);
  };

  return (
    <BannerContainer color="blue">
      <InfoIcon color="#001489" />
      <Text>
        <Template code="CaseMerging-CaseCreatedAndContactAdded" caseId={caseId} />
      </Text>
      <BannerActionLink type="button" onClick={handleCancelCase} data-fs-id="CancelNewCase-Button">
        <Template code="CaseMerging-CancelCase" />
      </BannerActionLink>
    </BannerContainer>
  );
};

CreatedCaseBanner.displayName = 'CreatedCaseBanner';

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CreatedCaseBanner);
