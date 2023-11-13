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
import { connect, ConnectedProps } from 'react-redux';

import { getPermissionsForCase, PermissionActions } from '../../permissions';
import { Case, Profile } from '../../types/types';
import CasePreview from '../search/CasePreview';
import ProfileRelationshipList from './ProfileRelationshipList';
import * as ProfileTypes from '../../states/profile/types';
import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import { ProfileCommonProps } from './types';

type OwnProps = ProfileCommonProps;

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileCases: React.FC<Props> = ({ profileId, task, counselorsHash }) => {
  const renderItem = (cas: Case) => {
    const { can } = getPermissionsForCase(cas.twilioWorkerId, cas.status);
    const onClickViewCase = () => {
      // load case modal? or page?
    };

    return (
      <CasePreview
        key={`CasePreview-${cas.id}`}
        task={task}
        currentCase={cas}
        counselorsHash={counselorsHash}
        onClickViewCase={can(PermissionActions.VIEW_CASE) && onClickViewCase}
      />
    );
  };

  return (
    <ProfileRelationshipList
      profileId={profileId}
      type={'cases' as ProfileTypes.ProfileRelationships}
      renderItem={renderItem}
    />
  );
};

const mapStateToProps = ({ [namespace]: { configuration } }: RootState) => {
  const { counselors } = configuration;
  return {
    counselorsHash: counselors.hash,
  };
};

const connector = connect(mapStateToProps);
export default connector(ProfileCases);
