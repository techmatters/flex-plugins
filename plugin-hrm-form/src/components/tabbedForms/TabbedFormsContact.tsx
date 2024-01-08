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

import { RootState } from '../../states';
import { namespace } from '../../states/storeNamespaces';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { ContactRoute } from '../../states/routing/types';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { CaseLayout } from '../case/styles';
import ContactDetails from '../contact/ContactDetails';
import { TabbedFormsCommonProps } from './types';

type OwnProps = TabbedFormsCommonProps;

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const routingState = state[namespace].routing;
  const currentRoute = getCurrentTopmostRouteForTask(routingState, taskSid);
  const contactId = (currentRoute as ContactRoute)?.id;

  return {
    contactId,
  };
};

const connector = connect(mapStateToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

const TabbedFormsContact: React.FC<Props> = ({ task, contactId }) => {
  return (
    <CaseLayout>
      <ContactDetails contactId={contactId} task={task} enableEditing={true} context={DetailsContext.CONTACT_SEARCH} />
    </CaseLayout>
  );
};

TabbedFormsContact.displayName = 'TabbedFormsContact';

export default connector(TabbedFormsContact);
