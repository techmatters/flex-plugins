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

/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';

import { CaseLayout } from '../../styles/case';
import { RootState } from '../../states';
import ContactDetails from '../contact/ContactDetails';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { namespace } from '../../states/storeNamespaces';

const mapStateToProps = (
  { [namespace]: { activeContacts, configuration, connectedCase: connectedCaseState } }: RootState,
  { task, contactId }: OwnProps,
) => {
  const connectedCase = connectedCaseState.tasks[task.taskSid]?.connectedCase;
  if (connectedCase) {
    const contact = activeContacts.existingContacts[contactId]?.savedContact;
    const enableEditing = Boolean(connectedCase.connectedContacts?.find(cc => cc.id?.toString() === contactId));
    return {
      contact,
      enableEditing,
    };
  }
  return {};
};

type OwnProps = {
  task: CustomITask | StandaloneITask;
  contactId: string;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const ViewContact: React.FC<Props> = ({ contactId, enableEditing, task }) => {
  return (
    <CaseLayout>
      <ContactDetails
        contactId={contactId}
        enableEditing={enableEditing}
        context={DetailsContext.CASE_DETAILS}
        task={task}
      />
    </CaseLayout>
  );
};

ViewContact.displayName = 'ViewContact';

export default connect(mapStateToProps)(ViewContact);
