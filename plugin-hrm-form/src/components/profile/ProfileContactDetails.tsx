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
import { callTypes, DataCallTypes } from '@tech-matters/hrm-form-definitions';

import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { ChangeRouteMode, isContactRoute, TabbedFormSubroutes } from '../../states/routing/types';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import ContactDetails from '../contact/ContactDetails';
import { ProfileCommonProps } from './types';
import { changeRoute, newCloseModalAction } from '../../states/routing/actions';

type OwnProps = ProfileCommonProps;

const mapStateToProps = (state: RootState, { task: { taskSid } }) => {
  const routingState = state[namespace].routing;
  const currentRoute = getCurrentTopmostRouteForTask(routingState, taskSid);
  const contactId = isContactRoute(currentRoute) && currentRoute?.id;

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

const ProfileContactDetails: React.FC<Props> = ({ closeModal, navigateToTab, ...props }) => {
  const handleConnectConfirmDialog = (callType: DataCallTypes) => {
    closeModal();
    if (callType === callTypes.caller) {
      navigateToTab('callerInformation');
    } else {
      navigateToTab('childInformation');
    }
  };

  return (
    <ContactDetails
      {...props}
      onConfirmConnectDialog={handleConnectConfirmDialog}
      context={DetailsContext.CONTACT_SEARCH}
    />
  );
};

export default connector(ProfileContactDetails);
