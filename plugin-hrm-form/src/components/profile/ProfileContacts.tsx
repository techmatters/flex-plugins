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

import { getPermissionsForContact, PermissionActions } from '../../permissions';
import { Contact } from '../../types/types';
import ContactPreview from '../search/ContactPreview';
import * as ProfileTypes from '../../states/profile/types';
import { useModalRouter } from '../../states/routing/hooks';
import ProfileRelationshipList from './ProfileRelationshipList';
import { ProfileCommonProps } from './types';

type OwnProps = ProfileCommonProps;

type Props = OwnProps;

const ProfileContacts: React.FC<Props> = ({ profileId, task }) => {
  const { openModal } = useModalRouter(task);
  const renderItem = (contact: Contact) => {
    const { can } = getPermissionsForContact(contact.twilioWorkerId);
    const handleViewDetails = () => {
      if (!can(PermissionActions.VIEW_CONTACT)) return;

      openModal('profileContact', { id: contact.id.toString() });
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

export default ProfileContacts;
