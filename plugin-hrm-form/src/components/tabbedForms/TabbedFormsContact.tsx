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
import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { callTypes, DataCallTypes } from 'hrm-form-definitions';

import { RootState } from '../../states';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { ChangeRouteMode, ContactRoute, TabbedFormSubroutes } from '../../states/routing/types';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { CaseLayout } from '../case/styles';
import ContactDetails from '../contact/ContactDetails';
import { TabbedFormsCommonProps } from './types';
import { changeRoute, newCloseModalAction } from '../../states/routing/actions';

type OwnProps = TabbedFormsCommonProps;

const mapStateToProps = (state: RootState, { task: { taskSid } }: OwnProps) => {
  const currentRoute = selectCurrentTopmostRouteForTask(state, taskSid);
  const contactId = (currentRoute as ContactRoute)?.id;
  return {
    contactId,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: OwnProps) => ({
  closeModal: () => dispatch(newCloseModalAction(task.taskSid, 'tabbed-forms')),
  navigateToTab: (tab: TabbedFormSubroutes) =>
    dispatch(
      changeRoute({ route: 'tabbed-forms', subroute: tab, autoFocus: false }, task.taskSid, ChangeRouteMode.Replace),
    ),
});
const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

const TabbedFormsContact: React.FC<Props> = ({ task, contactId, closeModal, navigateToTab }) => {
  const handleConnectConfirmDialog = (callType: DataCallTypes) => {
    closeModal();
    if (callType === callTypes.caller) {
      navigateToTab('callerInformation');
    } else {
      navigateToTab('childInformation');
    }
  };

  return (
    <CaseLayout>
      <ContactDetails
        contactId={contactId}
        task={task}
        enableEditing={true}
        onConfirmConnectDialog={handleConnectConfirmDialog}
        context={DetailsContext.CONTACT_SEARCH}
      />
    </CaseLayout>
  );
};

TabbedFormsContact.displayName = 'TabbedFormsContact';

export default connector(TabbedFormsContact);
