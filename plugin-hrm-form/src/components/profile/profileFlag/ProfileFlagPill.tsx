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
import { format } from 'date-fns';

import { ProfileFlag } from '../../../types/types';
import { FlagPill, ProfileFlagsListItem, StyledBlockOutlinedIcon, FlagPillTime } from '../styles';

type Props = {
  flag: ProfileFlag;
  renderDisassociate?: (flag: ProfileFlag) => JSX.Element;
};

const ProfileFlagPill: React.FC<Props> = ({ flag, renderDisassociate }) => {
  let formattedDate = '';
  if (flag.validUntil) {
    formattedDate = `${format(new Date(flag.validUntil), 'MMMM d, yyyy, h:mma')}`;
  }
  return (
    <ProfileFlagsListItem key={flag.name}>
      <FlagPill title={`${flag.name} Status`} key={flag.name} fillColor="#F5EEF4" isBlocked={flag.name === 'blocked'}>
        {flag.name === 'blocked' && <StyledBlockOutlinedIcon />}
        {flag.name.charAt(0).toUpperCase() + flag.name.slice(1)}{' '}
        <FlagPillTime>{flag.validUntil && `until ${formattedDate}`}</FlagPillTime>
        {renderDisassociate && renderDisassociate(flag)}
      </FlagPill>
    </ProfileFlagsListItem>
  );
};

export default ProfileFlagPill;
