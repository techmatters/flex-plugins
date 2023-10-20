import React from 'react';

import { Profile } from '../../types/types';

type OwnProps = {
  profileId: Profile['id'];
};

type Props = OwnProps;

const ProfileContacts: React.FC<Props> = ({ profileId }) => {
  return <div>Contacts</div>;
};

export default ProfileContacts;
