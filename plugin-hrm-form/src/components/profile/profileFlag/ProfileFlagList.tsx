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
import { Template } from '@twilio/flex-ui';

import { ProfileFlag } from '../../../types/types';
import { useProfileFlags } from '../../../states/profile/hooks';
import { selectProfileAsyncPropertiesById } from '../../../states/profile/selectors';
import {
  CloseIconButton,
  DisassociateButton,
  FlagPill,
  ProfileFlagsUnorderedList,
  ProfileFlagsListItem,
} from '../styles';
import { RootState } from '../../../states';
import { ProfileCommonProps } from '../types';
import ProfileFlagPill from './ProfileFlagPill';

type OwnProps = ProfileCommonProps & {
  disassociateRef?: React.RefObject<HTMLButtonElement>;
  enableDisassociate?: boolean;
};

type Props = OwnProps;

const ProfileFlagsList: React.FC<Props> = ({ disassociateRef, enableDisassociate, profileId }) => {
  const { profileFlags, disassociateProfileFlag } = useProfileFlags(profileId);
  const loading = useSelector((state: RootState) => selectProfileAsyncPropertiesById(state, profileId))?.loading;

  const renderDisassociate = (flag: ProfileFlag) => {
    if (!enableDisassociate) return null;

    return (
      <DisassociateButton
        icon={<CloseIconButton />}
        onClick={() => disassociateProfileFlag(flag.id)}
        title="Remove associated status"
        themeOverride={{ Icon: { size: '10px' } }}
        disabled={loading}
        ref={disassociateRef}
      />
    );
  };

  return (
    <ProfileFlagsUnorderedList aria-label="Profile Statuses">
      {profileFlags?.length ? (
        profileFlags.map(flag => <ProfileFlagPill key={flag.id} flag={flag} renderDisassociate={renderDisassociate} />)
      ) : (
        <ProfileFlagsListItem>
          <FlagPill title="No Status Listed">
            <Template code="Profile-NoStatusesListed" />
          </FlagPill>
        </ProfileFlagsListItem>
      )}
    </ProfileFlagsUnorderedList>
  );
};

export default ProfileFlagsList;
