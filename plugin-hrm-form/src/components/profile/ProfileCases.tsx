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
import { useDispatch, useSelector } from 'react-redux';

import { getInitializedCan } from '../../permissions/rules';
import { Case } from '../../types/types';
import CasePreview from '../search/CasePreview';
import ProfileRelationshipList from './ProfileRelationshipList';
import * as ProfileTypes from '../../states/profile/types';
import * as RoutingActions from '../../states/routing/actions';
import { ProfileCommonProps } from './types';
import { PermissionActions } from '../../permissions/actions';
import { selectCounselorsHash } from '../../states/configuration/selectCounselorsHash';

const ProfileCases: React.FC<ProfileCommonProps> = ({ profileId, task }) => {
  const dispatch = useDispatch();
  const counselorsHash = useSelector(selectCounselorsHash);

  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const renderItem = (cas: Case) => {
    const handleClickViewCase = () => {
      if (can(PermissionActions.VIEW_CASE, cas)) {
        dispatch(
          RoutingActions.newOpenModalAction(
            { route: 'case', context: 'profile', subroute: 'home', caseId: cas.id, isCreating: false },
            task.taskSid,
          ),
        );
      }
    };

    return (
      <CasePreview
        key={`CasePreview-${cas.id}`}
        task={task}
        currentCase={cas}
        counselorsHash={counselorsHash}
        onClickViewCase={handleClickViewCase}
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

ProfileCases.displayName = 'ProfileCases';

export default ProfileCases;
