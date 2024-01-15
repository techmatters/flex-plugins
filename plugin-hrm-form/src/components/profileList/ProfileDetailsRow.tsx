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
} from '../../styles';
import { newOpenModalAction } from '../../states/routing/actions';
import { useProfileFlags } from '../../states/profile/hooks';
import { useProfileSectionLoaderByType } from '../../states/profile/hooks/useProfileSection';

const CHAR_LIMIT = 200;

type Props = {
  profileId: number;
};

const ProfileDetailsRow: React.FC<Props> = ({ profileId }) => {
  const dispatch = useDispatch();
  const { profile } = useProfile({ profileId });
  const { profileFlags } = useProfileFlags(profileId);
  const summarySection = profile.profileSections?.find(ps => ps.sectionType === 'summary');
  useProfileSectionLoaderByType({ profileId, sectionType: summarySection?.sectionType });

  const handleViewProfile = async () => {
    dispatch(newOpenModalAction({ route: 'profile', profileId, subroute: 'details' }, 'standalone-task-sid'));
  };

  return (
    <DataTableRow onClick={handleViewProfile}>
      <NumericCell>
        <OpenLinkContainer>
          <OpenLinkAction tabIndex={0}>{profile?.name ? profile.name : profile?.id}</OpenLinkAction>
        </OpenLinkContainer>
      </NumericCell>
      {profileFlags.length > 0 ? (
        <PillsCell>
          {profileFlags
            .sort((a, b) => a.id - b.id)
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
      <DataCell>
        <TableBodyFont>{profile?.identifiers.map(i => i.identifier).join('\n')}</TableBodyFont>
      </DataCell>
      <SummaryCell>
        <TableBodyFont>{getShortSummary(summarySection?.content, CHAR_LIMIT, 'profile')}</TableBodyFont>
      </SummaryCell>
    </DataTableRow>
  );
};

// eslint-disable-next-line import/no-unused-modules
export default ProfileDetailsRow;
