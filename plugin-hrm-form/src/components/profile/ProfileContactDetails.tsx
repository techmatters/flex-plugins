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

import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { isContactRoute } from '../../states/routing/types';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import ContactDetails from '../contact/ContactDetails';
import { ProfileCommonProps } from './types';

type OwnProps = ProfileCommonProps;

const mapStateToProps = (state: RootState, { task: { taskSid } }) => {
  const routingState = state[namespace].routing;
  const currentRoute = getCurrentTopmostRouteForTask(routingState, taskSid);
  const contactId = isContactRoute(currentRoute) && currentRoute?.id;

  return {
    contactId,
  };
};

const connector = connect(mapStateToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileContactDetails: React.FC<Props> = (props: Props) => {
  return <ContactDetails {...props} context={DetailsContext.CONTACT_SEARCH} />;
};

export default connector(ProfileContactDetails);
