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
import { connect } from 'react-redux';

import { getPermissionsForCase, PermissionActions } from '../../permissions';
import { Case, Profile } from '../../types/types';
import CasePreview from '../search/CasePreview';
import ProfileRelationships from './ProfileRelationships';
import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';

type OwnProps = {
  profileId: Profile['id'];
  counselorsHash: any;
};

const ProfileCases: React.FC<OwnProps> = ({ profileId, counselorsHash }) => {
  const renderItem = (cas: Case) => {
    const { can } = getPermissionsForCase(cas.twilioWorkerId, cas.status);
    const onClickViewCase = () => {
      // load case modal? or page?
    };

    return (
      <CasePreview
        key={`CasePreview-${cas.id}`}
        currentCase={cas}
        counselorsHash={counselorsHash}
        onClickViewCase={can(PermissionActions.VIEW_CASE) && onClickViewCase}
      />
    );
  };

  return <ProfileRelationships profileId={profileId} type="cases" renderItem={renderItem} />;
};

const mapStateToProps = ({ [namespace]: { configuration } }: RootState) => {
  const { counselors } = configuration;
  return {
    counselorsHash: counselors.hash,
  };
};

export default connect(mapStateToProps)(ProfileCases);
