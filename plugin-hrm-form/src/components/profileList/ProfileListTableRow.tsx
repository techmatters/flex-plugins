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

import { useProfile } from '../../states/profile/hooks/useProfile';
import { Profile } from '../../states/profile/types';
import { DataTableRow, DataCell } from '../../styles';
import { newOpenModalAction } from '../../states/routing/actions';

type OwnProps = {
  profileId: Profile['id'];
};

type Props = OwnProps & {
  openProfileDetails: (profileId: string) => void;
};

const ProfileListRow: React.FC<Props> = ({ profileId, openProfileDetails }) => {
  const { profile } = useProfile({ profileId });

  return (
    <DataTableRow onClick={()=>console.log('open profile')}>
      <DataCell>{profile?.name}</DataCell>
      <DataCell>{profile?.identifiers?.join(', ')}</DataCell>
    </DataTableRow>
  );
};

const mapDispatchToProps = dispatch => {
  return {
    openProfileDetails: profileId =>
      dispatch(newOpenModalAction({ route: 'profile', subroute: 'home', profileId }, 'standalone-task-sid')),
  };
};

const connector = connect(null, mapDispatchToProps);
export default connector(ProfileListRow);
