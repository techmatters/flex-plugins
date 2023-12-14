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
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import asyncDispatch from '../../states/asyncDispatch';
import { removeFromCaseAsyncAction } from '../../states/contacts/saveContact';
import { newOpenModalAction } from '../../states/routing/actions';
import { setConnectedCase } from '../../states/case/actions';
import selectCaseByTaskSid from '../../states/case/selectCaseByTaskSid';
import type { Case } from '../../types/types';
import { BannerContainer, Text, CaseLink, BannerActionLink } from './styles';
import InfoIcon from './InfoIcon';
import { showRemovedFromCaseBannerAction } from '../../states/case/caseBanners';
import { RootState } from '../../states';
import { namespace } from '../../states/storeNamespaces';

type OwnProps = {
  taskId: string;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const mapStateToProps = (state: RootState, { taskId }: OwnProps) => {
  const contact = selectContactByTaskSid(state, taskId);
  const caseId = contact?.savedContact?.caseId;
  const connectedCase = state[namespace].activeContacts.caseConnectedToContact[contact?.savedContact?.id];
  const { savedContact } = selectContactByTaskSid(state, taskId);

  return {
    contact: savedContact,
    connectedCase,
    caseId,
  };
};

const mapDispatchToProps = (dispatch, { taskId }: OwnProps) => ({
  viewCaseDetails: (cas: Case) => {
    dispatch(setConnectedCase(cas, taskId));
    dispatch(newOpenModalAction({ route: 'case', subroute: 'home', isCreating: false }, taskId));
  },
  removeContactFromCase: async (contactId: string) => {
    await asyncDispatch(dispatch)(removeFromCaseAsyncAction(contactId));
    dispatch(showRemovedFromCaseBannerAction(contactId));
  },
});

const ContactAddedToCaseBanner: React.FC<Props> = ({
  connectedCase,
  contact,
  viewCaseDetails,
  removeContactFromCase,
  caseId,
}) => {
  if (connectedCase === undefined) return null;

  return (
    <BannerContainer color="blue">
      <InfoIcon color="#001489" />
      <Text>
        <Template code="CaseMerging-ContactAddedTo" />
      </Text>
      <CaseLink type="button" onClick={() => viewCaseDetails(connectedCase)}>
        <Template code="Case-CaseNumber" />
        {caseId}
      </CaseLink>
      <BannerActionLink type="button" onClick={() => removeContactFromCase(contact.id)}>
        <Template code="CaseMerging-RemoveFromCase" />
      </BannerActionLink>
    </BannerContainer>
  );
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(ContactAddedToCaseBanner);

export default connected;
