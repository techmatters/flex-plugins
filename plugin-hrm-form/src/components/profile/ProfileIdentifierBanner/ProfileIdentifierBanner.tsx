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
import { YellowBanner, LinkedBanner } from '../styles';
import { Bold } from '../../../styles';
import { CoreChannelTypes, coreChannelTypes } from '../../../states/DomainConstants';
import { newOpenModalAction } from '../../../states/routing/actions';
import { getFormattedNumberFromTask, getNumberFromTask, getContactValueTemplate } from '../../../utils';
import { getInitializedCan, PermissionActions } from '../../../permissions';
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
  // const { contactsCount, casesCount } = profile;
  console.log('>>> ProfileIdentifierBanner', profile, contactsCount, casesCount);
  // useProfileProperty(profileId)

  // sell using icons instead of text - See TimelineIcon.tsx
  const localizedSourceFromTask: { [channelType in CoreChannelTypes]: string } = {
    [coreChannelTypes.web]: `${getContactValueTemplate(task)}`,
    [coreChannelTypes.voice]: 'PreviousContacts-PhoneNumber',
    [coreChannelTypes.sms]: 'PreviousContacts-PhoneNumber',
    [coreChannelTypes.whatsapp]: 'PreviousContacts-WhatsappNumber',
    [coreChannelTypes.facebook]: 'PreviousContacts-FacebookUser',
    [coreChannelTypes.twitter]: 'PreviousContacts-TwitterUser',
    [coreChannelTypes.instagram]: 'PreviousContacts-InstagramUser',
    [coreChannelTypes.line]: 'PreviousContacts-LineUser',
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
    <div>
      <YellowBanner data-testid="PreviousContacts-Container" className="hiddenWhenModalOpen">
        <span>
          {/* <Template code={localizedSourceFromTask[task.channelType]} />{' '} */}
          {maskIdentifiers ? (
            <Bold>
              <Template code="MaskIdentifiers" />
            </Bold>
          ) : (
            <Bold>{formattedIdentifier}</Bold>
          )}{' '}
          has{' '}
          <LinkedBanner type="button" onClick={handleViewContacts}>
            <Bold>
              {contactsCount} <Template code={`PreviousContacts-PreviousContact${contactsCount === 1 ? '' : 's'}`} />
            </Bold>
          </LinkedBanner>{' '}
          <Template code="PreviousContacts-And" />{' '}
          <LinkedBanner type="button" onClick={handleViewCases}>
            <Bold>
              {casesCount} <Template code={`PreviousContacts-Case${casesCount === 1 ? '' : 's'}`} />
            </Bold>
          </LinkedBanner>{' '}
          <Template code="PreviousContacts-And" />{' '}
          <LinkedBanner type="button" onClick={handleViewClients}>
            <Bold>
              {'1'} <Template code="Profile-Singular-Client" />{' '}
            </Bold>
          </LinkedBanner>
        </span>
      </YellowBanner>
    </div>
  );
};

ProfileIdentifierBanner.displayName = 'PreviousContactsBanner';
export default connector(ProfileIdentifierBanner);
