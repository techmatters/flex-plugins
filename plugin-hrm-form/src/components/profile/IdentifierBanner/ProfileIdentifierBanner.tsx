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
import { Template } from '@twilio/flex-ui';

import { useIdentifierByIdentifier, useProfile, useProfileRelationshipsByType } from '../../../states/profile/hooks';
import { BannerLink, IconContainer, IdentifierContainer, YellowBannerContainer } from './styles';
import { Bold } from '../../../styles';
import { newOpenModalAction } from '../../../states/routing/actions';
import { getFormattedNumberFromTask, getNumberFromTask, getTaskChannelType } from '../../../utils';
import { getInitializedCan, PermissionActions } from '../../../permissions';
import { CustomITask } from '../../../types/types';
import { iconsFromTask } from './iconsFromTask';

type OwnProps = {
  task: CustomITask;
  enableClientProfiles?: boolean;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { task } = ownProps;
  const taskId = task.taskSid;

  return {
    openProfileModal: id => {
      dispatch(newOpenModalAction({ route: 'profile', profileId: id }, taskId));
    },
    openContactsModal: id => {
      dispatch(newOpenModalAction({ route: 'profile', subroute: 'contacts', profileId: id }, taskId));
    },
    openCasesModal: id => {
      dispatch(newOpenModalAction({ route: 'profile', subroute: 'cases', profileId: id }, taskId));
    },
  };
};

const connector = connect(null, mapDispatchToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileIdentifierBanner: React.FC<Props> = ({ task, openProfileModal, openContactsModal, openCasesModal }) => {
  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const formattedIdentifier = getFormattedNumberFromTask(task);
  const identifierIdentifier = getNumberFromTask(task);
  const { identifier } = useIdentifierByIdentifier({ identifierIdentifier, shouldAutoload: true });

  /**
   * This is a known hack that is OK as long as we ensure that there is only exactly 1 Profile for each Identifier.
   * When the time comes that's no longer true, below logic should accoutn for all the Profiles related to the Identifier.
   */
  const profileId = identifier?.profiles?.[0]?.id;

  const { canView, profile } = useProfile({ profileId });
  const showProfile = canView && profile && profile.hasContacts !== false; // If the flag is null or undefined, we assume the backend doesn't support it and show the profile to be on the safe side

  const { total: contactsCount, loading: contactsLoading } = useProfileRelationshipsByType({
    profileId,
    page: 0,
    type: 'contacts',
  });
  const { total: casesCount, loading: casesLoading } = useProfileRelationshipsByType({
    profileId,
    page: 0,
    type: 'cases',
  });

  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  // We immediately create a contact when a task is created, so we don't want to show the banner
  const shouldDisplayBanner = showProfile || contactsCount > 0 || casesCount > 0;
  if (!shouldDisplayBanner || contactsLoading || casesLoading) return null;

  const handleViewClients = () => {
    openProfileModal(profileId);
  };
  const handleViewContacts = () => {
    openContactsModal(profileId);
  };
  const handleViewCases = () => {
    openCasesModal(profileId);
  };

  return (
    <YellowBannerContainer data-testid="PreviousContacts-Container" className="hiddenWhenModalOpen">
      <IconContainer>{iconsFromTask[getTaskChannelType(task)]}</IconContainer>
      <IdentifierContainer>
        <Bold>{maskIdentifiers ? <Template code="MaskIdentifiers" /> : formattedIdentifier}</Bold>
      </IdentifierContainer>
      <Template code="PreviousContacts-Has" />
      <BannerLink type="button" onClick={handleViewContacts}>
        <Bold>
          {contactsCount > 0 && (
            <>
              {' '}
              {contactsCount} <Template code={`PreviousContacts-PreviousContact${contactsCount === 1 ? '' : 's'}`} />{' '}
            </>
          )}
        </Bold>
      </BannerLink>
      {casesCount > 0 && (
        <>
          {showProfile ? (
            contactsCount > 0 && <>, </>
          ) : (
            <div style={{ margin: '1px 0 0 0', alignSelf: 'end' }}>
              &nbsp;
              <Template code="PreviousContacts-And" />
            </div>
          )}
          <BannerLink type="button" onClick={handleViewCases}>
            <Bold>
              {casesCount} <Template code={`PreviousContacts-Case${casesCount === 1 ? '' : 's'}`} />
            </Bold>
          </BannerLink>
        </>
      )}
      {showProfile && (
        <>
          {(contactsCount > 0 || casesCount > 0) && (
            <div>
              &nbsp;
              <Template code="PreviousContacts-And" />
            </div>
          )}
          <BannerLink type="button" onClick={handleViewClients}>
            <Bold>
              {'1'} <Template code="Profile-Singular-Client" />
            </Bold>
          </BannerLink>
        </>
      )}
    </YellowBannerContainer>
  );
};

ProfileIdentifierBanner.displayName = 'PreviousContactsBanner';
export default connector(ProfileIdentifierBanner);
