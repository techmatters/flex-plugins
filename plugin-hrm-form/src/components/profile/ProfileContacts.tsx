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
import { useDispatch } from 'react-redux';

import { getInitializedCan } from '../../permissions/rules';
import { Contact } from '../../types/types';
import ContactPreview from '../search/ContactPreview';
import * as ProfileTypes from '../../states/profile/types';
import * as RoutingActions from '../../states/routing/actions';
import ProfileRelationshipList from './ProfileRelationshipList';
import { ProfileCommonProps } from './types';
import { PermissionActions } from '../../permissions/actions';

const ProfileContacts: React.FC<ProfileCommonProps> = ({ profileId, task }) => {
  const dispatch = useDispatch();

  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const renderItem = (contact: Contact) => {
    const handleViewDetails = () => {
      if (can(PermissionActions.VIEW_CONTACT, contact)) {
        dispatch(
          RoutingActions.newOpenModalAction(
            { route: 'contact', context: 'profile', subroute: 'view', id: contact.id.toString() },
            task.taskSid,
          ),
        );
      }
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

ProfileContacts.displayName = 'ProfileContacts';

export default ProfileContacts;
