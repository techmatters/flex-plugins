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

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { namespace, profileBase } from '../../states/storeNamespaces';
import * as ProfileActions from '../../states/profile/actions';
import { getPermissionsForContact, PermissionActions } from '../../permissions';
import * as RoutingActions from '../../states/routing/actions';
import { RootState } from '../../states';
import { Contact, Profile } from '../../types/types';
import ContactPreview from '../search/ContactPreview';

type OwnProps = {
  profileId: Profile['id'];
  contacts: Contact[];
  loading: boolean;
  loadRelationshipAsync: (profileId: Profile['id']) => void;
};

type Props = OwnProps;

const ProfileContacts: React.FC<Props> = ({ profileId, contacts, loading, loadRelationshipAsync }) => {
  useEffect(() => {
    loadRelationshipAsync(profileId);
  }, [profileId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const hasContacts = contacts && contacts.length > 0;

  if (!hasContacts) {
    return <div>No contacts found</div>;
  }

  const handleViewDetails = () => {
    // load contact modal? or page?
  };

  return (
    <>
      {contacts.map(contact => {
        const { can } = getPermissionsForContact(contact.twilioWorkerId);
        return (
          <ContactPreview
            key={`ContactPreview-${contact.id}`}
            contact={contact}
            handleViewDetails={() => can(PermissionActions.VIEW_CONTACT) && handleViewDetails}
          />
        );
      })}
    </>
  );
};

const mapStateToProps = (state: RootState, ownProps) => {
  const profileState = state[namespace][profileBase];
  const { profileId } = ownProps;
  const currentProfileState = profileState.profiles[profileId];

  const { data: contacts, loading } = currentProfileState.contacts;

  return {
    loading,
    contacts,
    profileId,
  };
};

const mapDispatchToProps = dispatch => ({
  loadRelationshipAsync: (profileId: Profile['id']) =>
    dispatch(
      ProfileActions.loadRelationshipAsync({
        profileId,
        type: 'contacts',
      }),
    ),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileContacts);
