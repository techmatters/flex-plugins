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
import { useSelector } from 'react-redux';
import { IconButton } from '@twilio/flex-ui';

import { CustomITask, Profile, ProfileFlag } from '../../../types/types';
import { useProfileFlags } from '../../../states/profile/hooks';
import { selectProfileAsyncPropertiesById } from '../../../states/profile/selectors';
import { StatusLabelPill } from '../styles';
import { RootState } from '../../../states';

type OwnProps = {
  enableDisassociate?: boolean;
  profileId: Profile['id'];
  task: CustomITask;
};

type Props = OwnProps;

const ProfileFlagsList: React.FC<Props> = ({ enableDisassociate, profileId }) => {
  const { profileFlags, disassociateProfileFlag } = useProfileFlags(profileId);
  const { loading } = useSelector((state: RootState) => selectProfileAsyncPropertiesById(state, profileId));

  const renderDisassociate = (flag: ProfileFlag) => {
    if (!enableDisassociate) return null;

    return (
      <IconButton
        icon="Close"
        onClick={() => disassociateProfileFlag(flag.id)}
        title="Disassociate Flag"
        themeOverride={{ Icon: { size: '10px' } }}
        disabled={loading}
      />
    );
  };

  const renderPill = (flag: ProfileFlag) => {
    return (
      <StatusLabelPill key={flag.name} fillColor="#F5EEF4" blocked={flag.name === 'blocked'}>
        {flag.name}
        {renderDisassociate(flag)}
      </StatusLabelPill>
    );
  };

  return <>{profileFlags?.length ? profileFlags.map(renderPill) : <StatusLabelPill>No Status</StatusLabelPill>}</>;
};

export default ProfileFlagsList;
