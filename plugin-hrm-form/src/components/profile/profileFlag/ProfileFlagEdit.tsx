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

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Popper, Paper } from '@material-ui/core';

import ProfileFlagList from './ProfileFlagList';
import { StyledMenuItem } from '../../../styles/HrmStyles';
import { RouterTask, Profile, ProfileFlag } from '../../../types/types';
import { selectProfileAsyncPropertiesById } from '../../../states/profile/selectors';
import { useProfileFlags } from '../../../states/profile/hooks';
import { RootState } from '../../../states';
import { StyledFlagEditList } from '../styles';

type OwnProps = {
  profileId: Profile['id'];
  task: RouterTask;
};

type Props = OwnProps;

const ProfileFlagsEdit: React.FC<Props> = (props: Props) => {
  const { profileId } = props;
  const { allProfileFlags, profileFlags, associateProfileFlag } = useProfileFlags(profileId);
  const { loading } = useSelector((state: RootState) => selectProfileAsyncPropertiesById(state, profileId));

  const anchorRef = useRef(null);

  const [open, setOpen] = useState(true);

  const availableFlags = allProfileFlags.filter(flag => !profileFlags.find(f => f.id === flag.id));

  useEffect(() => {
    setOpen(Boolean(availableFlags.length));
  }, [availableFlags]);

  const renderValue = () => <ProfileFlagList {...props} enableDisassociate={true} />;
  const shouldAllowAssociate = availableFlags.length && !loading;

  return (
    <>
      <StyledFlagEditList ref={anchorRef}>{renderValue()}</StyledFlagEditList>
      <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start">
        <Paper>
          {availableFlags.map((flag: ProfileFlag) => (
            <StyledMenuItem key={flag.id} onClick={() => shouldAllowAssociate && associateProfileFlag(flag.id)}>
              {flag.name}
            </StyledMenuItem>
          ))}
        </Paper>
      </Popper>
    </>
  );
};

export default ProfileFlagsEdit;
