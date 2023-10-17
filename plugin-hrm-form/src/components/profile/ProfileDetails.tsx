import React from 'react';

type OwnProps = {
  profileId: number;
};

type Props = OwnProps;

const ProfileDetails: React.FC<Props> = ({ profileId }) => {
  return <div>Profile Details: {profileId}</div>;
};
