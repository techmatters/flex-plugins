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
import { Template, ITask, withTaskContext } from '@twilio/flex-ui';

import { BannerContainer, Text, BannerActionLink } from './styles';
import InfoIcon from './InfoIcon';
import asyncDispatch from '../../states/asyncDispatch';
import { removeFromCaseAsyncAction } from '../../states/contacts/saveContact';
import { showRemovedFromCaseBannerAction } from './state';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import selectCaseByTaskSid from '../../states/case/selectCaseByTaskSid';

type OwnProps = {
  task?: ITask;
  caseId: string;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const mapStateToProps = (state, { task }: OwnProps) => {
  const contact = selectContactByTaskSid(state, task.taskSid);
  const cas = selectCaseByTaskSid(state, task.taskSid);
  return {
    contactId: contact.savedContact.id,
    cas,
  };
};

const mapDispatchToProps = (dispatch, { task }: OwnProps) => ({
  removeContactFromCase: async (contactId: string, caseId: number) => {
    await asyncDispatch(dispatch)(removeFromCaseAsyncAction(contactId, caseId));
    // TODO: close current modal
    dispatch(showRemovedFromCaseBannerAction(contactId));
  },
});

const CreatedCaseBanner: React.FC<Props> = ({ task, caseId, contactId, cas }) => {
  const cancelCase = async () => {
    // const contactIds = cas.connectedContacts.map(c => c.id);
    // await Promise.all(contactIds.map(id => disconnectFromCase(id)));
    // // TODO: Dont call service directly
    // await cancelCase(connectedCase.id);
    // cancelNewCase(connectedCase.id, loadedContactIds);
    // handleClose();
  };

  return (
    <BannerContainer color="blue">
      <InfoIcon color="#001489" />
      <Text>
        <Template code="CaseMerging-CaseCreatedAndContactAdded" caseId={caseId} />
      </Text>
      <BannerActionLink type="button" onClick={cancelCase}>
        <Template code="CaseMerging-CancelCase" />
      </BannerActionLink>
    </BannerContainer>
  );
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CreatedCaseBanner);

export default withTaskContext(connected);
