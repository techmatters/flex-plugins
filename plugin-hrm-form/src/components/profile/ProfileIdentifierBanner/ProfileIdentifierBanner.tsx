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
import { Template } from '@twilio/flex-ui';

import { useIdentifierByIdentifier, useProfileProperty } from '../../../states/profile/hooks';
import { YellowBanner } from '../../../styles/previousContactsBanner';
import { Bold } from '../../../styles/HrmStyles';
import { StyledLink } from '../../../styles/search';
import { ChannelTypes, channelTypes } from '../../../states/DomainConstants';
import { useRouting } from '../../../states/routing/hooks';
import { getFormattedNumberFromTask, getNumberFromTask, getContactValueTemplate } from '../../../utils';
import { getPermissionsForViewingIdentifiers, PermissionActions } from '../../../permissions';
import { RouterTask, isTwilioTask } from '../../../types/types';
import { ProfileModalParams } from '../types';

type OwnProps = {
  task: RouterTask;
  enableClientProfiles?: boolean;
};

type Props = OwnProps;

const ProfileIdentifierBanner: React.FC<Props> = ({ task }) => {
  const { openModal } = useRouting(task);
  const formattedIdentifier = getFormattedNumberFromTask(task);
  const identifierIdentifier = getNumberFromTask(task);
  const { identifier } = useIdentifierByIdentifier({ identifierIdentifier, shouldAutoload: true });
  const profileId = identifier?.profiles?.[0]?.id;
  const handleClickViewRecords = async () => {
    openModal<ProfileModalParams>('profile', { profileId });
  };

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
  if (!isTwilioTask(task) || !shouldDisplayBanner) return null;

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
export default ProfileIdentifierBanner;
