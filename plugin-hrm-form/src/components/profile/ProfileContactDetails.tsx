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
import { useDispatch, useSelector } from 'react-redux';
import { callTypes, DataCallTypes } from 'hrm-types';

import { RootState } from '../../states';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { ChangeRouteMode, isContactRoute, TabbedFormSubroutes } from '../../states/routing/types';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import ContactDetails from '../contact/ContactDetails';
import { ProfileCommonProps } from './types';
import { changeRoute, newCloseModalAction } from '../../states/routing/actions';
import { namespace } from '../../states/storeNamespaces';

const ProfileContactDetails: React.FC<ProfileCommonProps> = ({ task, ...props }) => {
  const dispatch = useDispatch();

  const routingState = useSelector((state: RootState) => state[namespace].routing);
  const currentRoute = getCurrentTopmostRouteForTask(routingState, task.taskSid);
  const contactId = isContactRoute(currentRoute) && currentRoute?.id;

  const handleConnectConfirmDialog = (callType: DataCallTypes) => {
    dispatch(newCloseModalAction(task.taskSid, 'tabbed-forms'));
    if (callType === callTypes.caller) {
      dispatch(
        changeRoute(
          { route: 'tabbed-forms', subroute: 'callerInformation', autoFocus: false },
          task.taskSid,
          ChangeRouteMode.Replace,
        ),
      );
    } else {
      dispatch(
        changeRoute(
          { route: 'tabbed-forms', subroute: 'childInformation', autoFocus: false },
          task.taskSid,
          ChangeRouteMode.Replace,
        ),
      );
    }
  };

  return (
    <ContactDetails
      {...props}
      contactId={contactId}
      task={task}
      onConfirmConnectDialog={handleConnectConfirmDialog}
      context={DetailsContext.CONTACT_SEARCH}
    />
  );
};

ProfileContactDetails.displayName = 'ProfileContactDetails';

export default ProfileContactDetails;
