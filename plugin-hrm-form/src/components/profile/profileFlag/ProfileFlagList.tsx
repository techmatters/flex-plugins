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
import { IconButton, Template } from '@twilio/flex-ui';

import { RouterTask, Profile, ProfileFlag } from '../../../types/types';
import { useProfileFlags } from '../../../states/profile/hooks';
import { selectProfileAsyncPropertiesById } from '../../../states/profile/selectors';
import { FlagPill, CloseIconButton } from '../styles';
import { RootState } from '../../../states';

type OwnProps = {
  enableDisassociate?: boolean;
  profileId: Profile['id'];
  task: RouterTask;
};

type Props = OwnProps;

const ProfileFlagsList: React.FC<Props> = ({ enableDisassociate, profileId }) => {
  const { profileFlags, disassociateProfileFlag } = useProfileFlags(profileId);
  const { loading } = useSelector((state: RootState) => selectProfileAsyncPropertiesById(state, profileId));

  const renderDisassociate = (flag: ProfileFlag) => {
    if (!enableDisassociate) return null;

    /*
     * We have to use onMouseDown instead of onClick because this is
     * rendered inside a Material UI Select component value, which will intercept
     * the click event and open the dropdown before the event bubbles up.
     * onMouseDown fires before onClick, so we can stop propagation and prevent
     * the dropdown from opening.
     */
    const handleDisassociate = (event: React.MouseEvent, flag: ProfileFlag) => {
      event.preventDefault();
      event.stopPropagation();
      disassociateProfileFlag(flag.id);
    };

    return (
      <IconButton
        icon={<CloseIconButton />}
        onMouseDown={event => handleDisassociate(event, flag)}
        title="Disassociate Flag"
        themeOverride={{ Icon: { size: '10px' } }}
        disabled={loading}
        // TODO: Remove inline styles
        style={{ width: '1rem', height: '1rem', padding: 0 }}
      />
    );
  };

  const renderPill = (flag: ProfileFlag) => {
    return (
      <FlagPill key={flag.name} fillColor="#F5EEF4" blocked={flag.name === 'blocked'}>
        {flag.name}
        {renderDisassociate(flag)}
      </FlagPill>
    );
  };

  return (
    <>
      {profileFlags?.length ? (
        profileFlags.map(renderPill)
      ) : (
        <FlagPill>
          <Template code="Profile-NoStatusesListed" />
        </FlagPill>
      )}
    </>
  );
};

export default ProfileFlagsList;
