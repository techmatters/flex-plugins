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
import { useDispatch } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';

import ProfileFlagPill from '../profile/profileFlag/ProfileFlagPill';
import { getShortSummary } from '../../utils';
import { useProfile } from '../../states/profile/hooks/useProfile';
import {
  DataTableRow,
  PillsCell,
  NumericCell,
  OpenLinkContainer,
  OpenLinkAction,
  SummaryCell,
  DataCell,
  TableBodyFont,
  OpaqueText,
  ErrorText,
} from '../../styles';
import { newOpenModalAction } from '../../states/routing/actions';
import { useProfileFlags, useProfileSectionByType } from '../../states/profile/hooks';
import { PermissionActions, getInitializedCan } from '../../permissions';

const CHAR_LIMIT = 200;

type Props = {
  profileId: number;
};

const ProfileDetailsRow: React.FC<Props> = ({ profileId }) => {
  const dispatch = useDispatch();
  const { profile, canView: canViewProfile } = useProfile({ profileId });
  const { combinedProfileFlags } = useProfileFlags(profileId);

  const { section: summarySection, error, loading, canView: canViewSummarySection } = useProfileSectionByType({
    profileId,
    sectionType: 'summary',
  });

  const handleViewProfile = async () => {
    if (canViewProfile) {
      dispatch(newOpenModalAction({ route: 'profile', profileId, subroute: 'details' }, 'standalone-task-sid'));
    }
  };

  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  return (
    <DataTableRow onClick={handleViewProfile}>
      <NumericCell>
        <OpenLinkContainer>
          <OpenLinkAction tabIndex={0}>{profile?.name ? profile.name : profile?.id}</OpenLinkAction>
        </OpenLinkContainer>
      </NumericCell>
      {combinedProfileFlags.length > 0 ? (
        <PillsCell>
          {combinedProfileFlags
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(flag => (
              <ProfileFlagPill key={flag.id} flag={flag} />
            ))}
        </PillsCell>
      ) : (
        <SummaryCell>
          <TableBodyFont>
            <OpaqueText>
              <Template code="ProfileList-Status-None" />
            </OpaqueText>
          </TableBodyFont>
        </SummaryCell>
      )}
      {maskIdentifiers ? null : (
        <DataCell>
          <TableBodyFont>{profile?.identifiers.map(i => i.identifier).join('\n')}</TableBodyFont>
        </DataCell>
      )}
      <SummaryCell>
        {error && <ErrorText>Please try again later</ErrorText>}
        {loading ? (
          <CircularProgress size={14} />
        ) : (
          <TableBodyFont>
            {getShortSummary(canViewSummarySection ? summarySection?.content : null, CHAR_LIMIT, 'profile')}
          </TableBodyFont>
        )}
      </SummaryCell>
    </DataTableRow>
  );
};

// eslint-disable-next-line import/no-unused-modules
export default ProfileDetailsRow;
