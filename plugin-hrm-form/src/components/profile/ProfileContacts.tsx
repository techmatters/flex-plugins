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

import { getPermissionsForContact, PermissionActions } from '../../permissions';
import { Contact, RouterTask, Profile } from '../../types/types';
import ContactPreview from '../search/ContactPreview';
import * as ProfileTypes from '../../states/profile/types';
import * as RoutingActions from '../../states/routing/actions';
import ProfileRelationshipList from './ProfileRelationshipList';

type OwnProps = {
  profileId: Profile['id'];
  task: RouterTask;
};

type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileContacts: React.FC<Props> = ({ profileId, viewContactDetails }) => {
  const renderItem = (contact: Contact) => {
    const { can } = getPermissionsForContact(contact.twilioWorkerId);
    const handleViewDetails = () => {
      console.log('>>>handleViewDetails', contact);
      if (can(PermissionActions.VIEW_CONTACT)) viewContactDetails(contact);
    };

    console.log('>>>can(PermissionActions.VIEW_CONTACT)', can(PermissionActions.VIEW_CONTACT));

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
      dispatch(RoutingActions.newOpenModalAction({ route: 'contact', subroute: 'view', id: id.toString() }, taskSid));
    },
  };
};

const connector = connect(null, mapDispatchToProps);

export default connector(ProfileContacts);
