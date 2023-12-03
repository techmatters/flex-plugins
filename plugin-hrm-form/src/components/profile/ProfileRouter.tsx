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

import { RouterTask } from '../../types/types';
import { useModalRouting, useRouting } from '../../states/routing/hooks';
import ProfileCaseDetails from './ProfileCaseDetails';
import ProfileContactDetails from './ProfileContactDetails';
import ProfileEdit from './ProfileEdit';
import ProfileTabs from './ProfileTabs';
import ProfileSectionEdit from './section/ProfileSectionEdit';
import { ProfileCommonProps } from './types';

type OwnProps = {
  task: RouterTask;
};
type Props = OwnProps;

type ProfileRouteConfig = {
  modals: string[];
  renderComponent: (props: Props) => JSX.Element;
};

const PROFILE_ROUTES: Record<string, ProfileRouteConfig> = {
  profile: {
    modals: ['profile'],
    renderComponent: (props: ProfileCommonProps) => <ProfileTabs {...props} />,
  },
  profileContact: {
    modals: ['profileContact'],
    renderComponent: (props: ProfileCommonProps) => <ProfileContactDetails {...props} />,
  },
  profileCase: {
    modals: ['profileCase'],
    renderComponent: (props: ProfileCommonProps) => <ProfileCaseDetails {...props} />,
  },
  profileEdit: {
    modals: ['profileEdit'],
    renderComponent: (props: ProfileCommonProps) => <ProfileEdit {...props} />,
  },
  profileSectionEdit: {
    modals: ['profileSectionEdit'],
    renderComponent: (props: ProfileCommonProps & { sectionType: string }) => (
      <ProfileSectionEdit {...props} sectionType={props.sectionType} />
    ),
  },
};

const MODALS = Object.values(PROFILE_ROUTES).flatMap(({ modals }) => modals);

export const isProfileRoute = ({ activeModal }: ReturnType<typeof useRouting>) =>
  activeModal && MODALS.includes(activeModal);

const ProfileRouter: React.FC<Props> = props => {
  const { activeModal, activeModalParams } = useModalRouting(props.task);

  return (
    Object.values(PROFILE_ROUTES)
      .find(({ modals }) => modals?.includes(activeModal))
      ?.renderComponent({ ...props, ...activeModalParams }) || null
  );
};

export default ProfileRouter;
