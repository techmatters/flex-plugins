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

import React, { useRef, useState } from 'react';

import ClickOutsideInterceptor from '../../common/ClickOutsideInterceptor';
import ProfileFlagList from './ProfileFlagList';
import ProfileFlagEdit from './ProfileFlagEdit';
import { ProfileCommonProps } from '../types';

type Props = ProfileCommonProps;

const ProfileFlagSection: React.FC<Props> = ({ profileId, task }) => {
  const [shouldEditProfileFlags, setShouldEditProfileFlags] = useState(false);
  const profileFlagsModalRef = useRef(null);

  return (
    <ClickOutsideInterceptor onClick={() => setShouldEditProfileFlags(false)} ignoreRefs={[profileFlagsModalRef]}>
      {shouldEditProfileFlags ? (
        <ProfileFlagEdit profileId={profileId} task={task} modalRef={profileFlagsModalRef} />
      ) : (
        <button type="button" onClick={() => setShouldEditProfileFlags(true)}>
          <ProfileFlagList profileId={profileId} task={task} />
        </button>
      )}
    </ClickOutsideInterceptor>
  );
};

export default ProfileFlagSection;
