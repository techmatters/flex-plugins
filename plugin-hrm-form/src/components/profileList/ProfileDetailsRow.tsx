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

import ProfileFlagChip from '../profile/profileFlag/ProfileFlagChip';
import { getShortSummary } from '../../utils/formatters';
import { useProfile } from '../../states/profile/hooks/useProfile';
import {
  DataTableRow,
  CategoriesCell,
  NumericCell,
  OpenLinkContainer,
  OpenLinkAction,
  SummaryCell,
  DataCell,
  TableBodyFont,
  OpaqueText,
} from '../../styles';
import { newOpenModalAction } from '../../states/routing/actions';
import { useProfileFlags, useProfileSectionByType } from '../../states/profile/hooks';
import { PermissionActions, getInitializedCan } from '../../permissions';

const CHAR_LIMIT = 250;

type Props = {
  profileId: number;
};

const ProfileDetailsRow: React.FC<Props> = ({ profileId }) => {
  const dispatch = useDispatch();
  const { profile, canView } = useProfile({ profileId });
  const { combinedProfileFlags } = useProfileFlags(profileId);

  const { section: summarySection, canView: canViewSummarySection } = useProfileSectionByType({
    profileId,
    sectionType: 'summary',
  });

  const handleViewProfile = async () => {
    dispatch(newOpenModalAction({ route: 'profile', profileId, subroute: 'details' }, 'standalone-task-sid'));
  };

  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  return (
    <DataTableRow onClick={canView && handleViewProfile}>
      <NumericCell>
        {canView ? (
          <OpenLinkContainer>
            <OpenLinkAction tabIndex={0}>{profile?.id}</OpenLinkAction>
          </OpenLinkContainer>
        ) : (
          <TableBodyFont>{profile?.id}</TableBodyFont>
        )}
      </NumericCell>
      <DataCell>
        <TableBodyFont>
          {profile?.name ? (
            profile?.name
          ) : (
            <OpaqueText>
              <Template code="ProfileList-ClientName-None" />
            </OpaqueText>
          )}
        </TableBodyFont>
      </DataCell>
      {combinedProfileFlags.length > 0 ? (
        <CategoriesCell>
          {combinedProfileFlags
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(flag => (
              <ProfileFlagChip key={flag.id} flag={flag} />
            ))}
        </CategoriesCell>
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
        <TableBodyFont>
          {getShortSummary(canViewSummarySection ? summarySection?.content : null, CHAR_LIMIT, 'profile')}
        </TableBodyFont>
      </SummaryCell>
    </DataTableRow>
  );
};

// eslint-disable-next-line import/no-unused-modules
export default ProfileDetailsRow;
