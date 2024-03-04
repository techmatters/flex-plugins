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

import { getInitializedCan, PermissionActions } from '../../permissions';
import { Case } from '../../types/types';
import CasePreview from '../search/CasePreview';
import ProfileRelationshipList from './ProfileRelationshipList';
import * as ProfileTypes from '../../states/profile/types';
import * as RoutingActions from '../../states/routing/actions';
import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import { ProfileCommonProps } from './types';
import { useCase } from '../../states/case/hooks/useCase';

type OwnProps = ProfileCommonProps;

type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileCases: React.FC<Props> = ({ profileId, task, counselorsHash, viewCaseDetails }) => {
  const renderItem = (cas: Case) => {
    const handleClickViewCase = () => {
      viewCaseDetails(cas);
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

const mapStateToProps = ({ [namespace]: { configuration } }: RootState) => {
  const { counselors } = configuration;
  return {
    counselorsHash: counselors.hash,
  };
};

const mapDispatchToProps = (dispatch, { task: { taskSid } }) => {
  return {
    viewCaseDetails: ({ id }: Case) => {
      dispatch(
        RoutingActions.newOpenModalAction(
          { route: 'case', context: 'profile', subroute: 'home', caseId: id, isCreating: false },
          taskSid,
        ),
      );
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(ProfileCases);
