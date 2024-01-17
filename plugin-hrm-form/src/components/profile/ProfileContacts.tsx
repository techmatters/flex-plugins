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

import { getInitializedCan, PermissionActions } from '../../permissions';
import { Contact } from '../../types/types';
import ContactPreview from '../search/ContactPreview';
import * as ProfileTypes from '../../states/profile/types';
import * as RoutingActions from '../../states/routing/actions';
import ProfileRelationshipList from './ProfileRelationshipList';
import { ProfileCommonProps } from './types';

type OwnProps = ProfileCommonProps;

type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileContacts: React.FC<Props> = ({ profileId, viewContactDetails }) => {
  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const renderItem = (contact: Contact) => {
    const handleViewDetails = () => {
      if (can(PermissionActions.VIEW_CONTACT, contact)) viewContactDetails(contact);
    };

    return (
      <ContactPreview key={`ContactPreview-${contact.id}`} contact={contact} handleViewDetails={handleViewDetails} />
    );
  };

  return (
    <ProfileRelationshipList
      profileId={profileId}
      type={'contacts' as ProfileTypes.ProfileRelationships}
      renderItem={renderItem}
    />
  );
};

const mapDispatchToProps = (dispatch, { task: { taskSid } }) => {
  return {
    viewContactDetails: ({ id }: Contact) => {
      dispatch(
        RoutingActions.newOpenModalAction(
          { route: 'contact', context: 'profile', subroute: 'view', id: id.toString() },
          taskSid,
        ),
      );
    },
  };
};

const connector = connect(null, mapDispatchToProps);

export default connector(ProfileContacts);
