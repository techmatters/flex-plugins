import React from 'react';

import { Profile } from '../../types/types';

type OwnProps = {
  profileId: Profile['id'];
};

type Props = OwnProps;

const ProfileCases: React.FC<Props> = ({ profileId }) => {
  return <div>Cases</div>;
};

export default ProfileCases;
