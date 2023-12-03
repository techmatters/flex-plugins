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
import { LocationDescriptorObject } from 'history';

import { RouterTask } from '../../types/types';
import { AppRoutes, isRouteWithContext } from '../../states/routing/types';
import useRouting from '../../states/routing/hooks/useRouting';
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
  subroutes: string[];
  renderComponent: (props: Props) => JSX.Element;
};

const PROFILE_ROUTES: Record<string, ProfileRouteConfig> = {
  profile: {
    subroutes: ['profile'],
    renderComponent: (props: ProfileCommonProps) => <ProfileTabs {...props} />,
  },
  profileContact: {
    subroutes: ['contact'],
    renderComponent: (props: ProfileCommonProps) => <ProfileContactDetails {...props} />,
  },
  profileCase: {
    subroutes: ['case'],
    renderComponent: (props: ProfileCommonProps) => <ProfileCaseDetails {...props} />,
  },
  profileEdit: {
    subroutes: ['profileEdit'],
    renderComponent: (props: ProfileCommonProps) => <ProfileEdit {...props} />,
  },
  profileSectionEdit: {
    subroutes: ['profileSectionEdit'],
    renderComponent: (props: ProfileCommonProps & { sectionType: string }) => (
      <ProfileSectionEdit {...props} sectionType={props.sectionType} />
    ),
  },
};

export const isProfileRoute = ({ activeModal }: ReturnType<typeof useRouting>) => activeModal === 'profile';

const ProfileRouter: React.FC<Props> = props => {
  const { activeModalParams } = useRouting(props.task);
  const subroute = activeModalParams?.subroute || 'profile';

  console.log('>>>ProfileRouter', { activeModalParams, subroute });

  return (
    Object.values(PROFILE_ROUTES)
      .find(({ subroutes }) => subroutes?.includes(subroute))
      ?.renderComponent({ ...props, ...activeModalParams }) || null
  );
};

export default ProfileRouter;
