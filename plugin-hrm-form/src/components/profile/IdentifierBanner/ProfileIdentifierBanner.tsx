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

/* eslint-disable react/prop-types */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import { useIdentifierByIdentifier, useProfile, useProfileProperty } from '../../../states/profile/hooks';
import { YellowBannerContainer, IconContainer, IdentifierContainer, BannerLink } from './styles';
import { Bold } from '../../../styles';
import { CoreChannelTypes, coreChannelTypes } from '../../../states/DomainConstants';
import { newOpenModalAction } from '../../../states/routing/actions';
import { getFormattedNumberFromTask, getNumberFromTask } from '../../../utils';
import { getInitializedCan, PermissionActions } from '../../../permissions';
import { CustomITask } from '../../../types/types';
import { getIcon } from '../../case/timeline/TimelineIcon';

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
  const profileId = identifier?.profiles?.[0]?.id;

  // Ugh. The previous contacts count is off by one because we immediately create a contact when a task is created.
  // contacts should really have a status so we can filter out the "active" contact on the db side.
  const contactsCount = useProfileProperty(profileId, 'contactsCount') || 0;
  const casesCount = useProfileProperty(profileId, 'casesCount') || 0;

  const { profile } = useProfile({ profileId });
  if (!profile) {
    return <div>Loading...</div>; // or some loading spinner
  }

  type ExtendedChannelTypes = CoreChannelTypes | 'modica';

  const iconsFromTask: { [channelType in ExtendedChannelTypes]: JSX.Element } = {
    ...{
      [coreChannelTypes.web]: getIcon(coreChannelTypes.web, '18px'),
      [coreChannelTypes.voice]: getIcon(coreChannelTypes.voice, '18px'),
      [coreChannelTypes.sms]: getIcon(coreChannelTypes.sms, '18px'),
      [coreChannelTypes.whatsapp]: getIcon(coreChannelTypes.whatsapp, '18px'),
      [coreChannelTypes.facebook]: getIcon(coreChannelTypes.facebook, '18px'),
      [coreChannelTypes.twitter]: getIcon(coreChannelTypes.twitter, '18px'),
      [coreChannelTypes.instagram]: getIcon(coreChannelTypes.instagram, '18px'),
      [coreChannelTypes.line]: getIcon(coreChannelTypes.line, '18px'),
    },
    modica: getIcon('modica', '18px'),
  };

  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  // We immediately create a contact when a task is created, so we don't want to show the banner
  const shouldDisplayBanner = contactsCount > 0 || casesCount > 0;
  if (!shouldDisplayBanner) return null;

  const handleViewClients = async () => {
    openProfileModal(profileId);
  };
  const handleViewContacts = async () => {
    openContactsModal(profileId);
  };
  const handleViewCases = async () => {
    openCasesModal(profileId);
  };

  return (
    <YellowBannerContainer data-testid="PreviousContacts-Container" className="hiddenWhenModalOpen">
      <IconContainer>{iconsFromTask[task.channelType]}</IconContainer>
      <IdentifierContainer>
        {maskIdentifiers ? (
          <Bold>
            <Template code="MaskIdentifiers" />
          </Bold>
        ) : (
          <Bold>{formattedIdentifier}</Bold>
        )}
      </IdentifierContainer>
      has
      {contactsCount > 0 && (
        <BannerLink type="button" onClick={handleViewContacts}>
          <Bold>
            {contactsCount} <Template code={`PreviousContacts-PreviousContact${contactsCount === 1 ? '' : 's'}`} />
          </Bold>
        </BannerLink>
      )}
      {casesCount > 0 && (
        <>
          {contactsCount > 0 && ', '}
          <BannerLink type="button" onClick={handleViewCases}>
            <Bold>
              {casesCount} <Template code={`PreviousContacts-Case${casesCount === 1 ? '' : 's'}`} />
            </Bold>
          </BannerLink>
        </>
      )}
      <Template code="PreviousContacts-And" />
      <BannerLink type="button" onClick={handleViewClients}>
        <Bold>
          {'1'} <Template code="Profile-Singular-Client" />
        </Bold>
      </BannerLink>
    </YellowBannerContainer>
  );
};

ProfileIdentifierBanner.displayName = 'PreviousContactsBanner';
export default connector(ProfileIdentifierBanner);
