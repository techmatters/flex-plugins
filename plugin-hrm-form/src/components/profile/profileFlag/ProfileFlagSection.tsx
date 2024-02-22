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

import { useProfile } from '../../../states/profile/hooks';
import ClickOutsideInterceptor from '../../common/ClickOutsideInterceptor';
import ProfileFlagList from './ProfileFlagList';
import ProfileFlagEdit from './ProfileFlagEdit';
import { ProfileCommonProps } from '../types';
import { ProfileFlagsEditButton } from '../styles';

type Props = ProfileCommonProps;

const ProfileFlagSection: React.FC<Props> = ({ profileId, task }) => {
  const [shouldEditProfileFlags, setShouldEditProfileFlags] = useState(false);
  const { canFlag, canUnflag } = useProfile({ profileId });

  /**
   * We need a ref to attach to the modal so that we can ignore clicks on it
   * in the ClickOutsideInterceptor since it's not a direct child of the ProfileFlagSection
   */
  const profileFlagsModalRef = useRef(null);
  const profileFlagsEditButtonRef = useRef(null);

  const openEditProfileFlags = () => {
    if (canFlag || canUnflag) setShouldEditProfileFlags(true);
  };
  const closeEditProfileFlags = () => {
    setShouldEditProfileFlags(false);
    // This won't actually focus on the button on click, but if escape is pressed it will
    profileFlagsEditButtonRef.current?.focus();
  };

  const renderViewMode = () => (
    <ProfileFlagsEditButton
      title="Edit Statuses"
      type="button"
      onClick={openEditProfileFlags}
      ref={profileFlagsEditButtonRef}
    >
      <ProfileFlagList profileId={profileId} task={task} />
    </ProfileFlagsEditButton>
  );

  const renderEditMode = () => (
    <ClickOutsideInterceptor onClick={closeEditProfileFlags} ignoreRefs={[profileFlagsModalRef]}>
      <ProfileFlagEdit profileId={profileId} task={task} modalRef={profileFlagsModalRef} />
    </ClickOutsideInterceptor>
  );

  return shouldEditProfileFlags ? renderEditMode() : renderViewMode();
};

export default ProfileFlagSection;
