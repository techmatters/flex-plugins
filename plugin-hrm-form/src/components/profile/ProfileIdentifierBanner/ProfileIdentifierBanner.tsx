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

import { useIdentifierByIdentifier, useProfileProperty } from '../../../states/profile/hooks';
import { YellowBanner } from '../styles';
import { Bold } from '../../../styles';
import { StyledLink } from '../../search/styles';
import { ChannelTypes, channelTypes } from '../../../states/DomainConstants';
import { newOpenModalAction } from '../../../states/routing/actions';
import { getFormattedNumberFromTask, getNumberFromTask, getContactValueTemplate } from '../../../utils';
import { getPermissionsForViewingIdentifiers, PermissionActions } from '../../../permissions';
import { CustomITask } from '../../../types/types';

type OwnProps = {
  task: CustomITask;
  enableClientProfiles?: boolean;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { task } = ownProps;
  const taskId = task.taskSid;

  return {
    openProfileModal: id => {
      dispatch(newOpenModalAction({ route: 'profile', id }, taskId));
    },
  };
};

const connector = connect(null, mapDispatchToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

const ProfileIdentifierBanner: React.FC<Props> = ({ task, openProfileModal }) => {
  const formattedIdentifier = getFormattedNumberFromTask(task);
  const identifierIdentifier = getNumberFromTask(task);
  const { identifier } = useIdentifierByIdentifier({ identifierIdentifier, shouldAutoload: true });
  const profileId = identifier?.profiles?.[0]?.id;

  // Ugh. The previous contacts count is off by one because we immediately create a contact when a task is created.
  // contacts should really have a status so we can filter out the "active" contact on the db side.
  const contactsCountState = useProfileProperty(profileId, 'contactsCount') || 0;
  const contactsCount = contactsCountState ? contactsCountState - 1 : 0;
  const casesCount = useProfileProperty(profileId, 'casesCount') || 0;

  const localizedSourceFromTask: { [channelType in ChannelTypes]: string } = {
    [channelTypes.web]: `${getContactValueTemplate(task)}`,
    [channelTypes.voice]: 'PreviousContacts-PhoneNumber',
    [channelTypes.sms]: 'PreviousContacts-PhoneNumber',
    [channelTypes.whatsapp]: 'PreviousContacts-WhatsappNumber',
    [channelTypes.facebook]: 'PreviousContacts-FacebookUser',
    [channelTypes.twitter]: 'PreviousContacts-TwitterUser',
    [channelTypes.instagram]: 'PreviousContacts-InstagramUser',
    [channelTypes.line]: 'PreviousContacts-LineUser',
  };

  const { canView } = getPermissionsForViewingIdentifiers();
  const maskIdentifiers = !canView(PermissionActions.VIEW_IDENTIFIERS);

  // We immediately create a contact when a task is created, so we don't want to show the banner
  const shouldDisplayBanner = contactsCount > 0 || casesCount > 0;
  if (!shouldDisplayBanner) return null;

  const handleClickViewRecords = async () => {
    openProfileModal(profileId);
  };

  return (
    <div>
      <YellowBanner data-testid="PreviousContacts-Container" className="hiddenWhenModalOpen">
        {/* eslint-disable-next-line prettier/prettier */}
        <pre>
          <Template code="PreviousContacts-ThereAre" />{' '}
          {contactsCount === 1 ? (
            <Bold>
              {contactsCount} <Template code="PreviousContacts-PreviousContact" />
            </Bold>
          ) : (
            <Bold>
              {contactsCount} <Template code="PreviousContacts-PreviousContacts" />
            </Bold>
          )}{' '}
          <Template code="PreviousContacts-And" />{' '}
          {casesCount === 1 ? (
            <Bold>
              {casesCount} <Template code="PreviousContacts-Case" />
            </Bold>
          ) : (
            <Bold>
              {casesCount} <Template code="PreviousContacts-Cases" />
            </Bold>
          )}{' '}
          <Template code="PreviousContacts-From" /> <Template code={localizedSourceFromTask[task.channelType]} />{' '}
          {maskIdentifiers ? (
            <Bold>
              <Template code="MaskIdentifiers" />
            </Bold>
          ) : (
            <Bold>{formattedIdentifier}</Bold>
          )}
          .{' '}
        </pre>
        <StyledLink
          underline
          data-testid="PreviousContacts-ViewRecords"
          onClick={handleClickViewRecords}
          aria-label="View Client Records"
        >
          <Template code="PreviousContacts-ViewRecords" />
        </StyledLink>
      </YellowBanner>
    </div>
  );
};

ProfileIdentifierBanner.displayName = 'PreviousContactsBanner';
export default connector(ProfileIdentifierBanner);
