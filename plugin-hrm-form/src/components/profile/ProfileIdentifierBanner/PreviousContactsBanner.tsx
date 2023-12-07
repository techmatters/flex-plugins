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
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import {
  searchCases as searchCasesAction,
  searchContacts as searchContactsAction,
  viewPreviousContacts as viewPreviousContactsAction,
} from '../../../states/search/actions';
import { RootState } from '../../../states';
import { CASES_PER_PAGE, CONTACTS_PER_PAGE } from '../../search/SearchResults';
import { YellowBanner } from '../../../styles/previousContactsBanner';
import { Bold } from '../../../styles/HrmStyles';
import { StyledLink } from '../../../styles/search';
import { ChannelTypes, channelTypes } from '../../../states/DomainConstants';
import { changeRoute, newOpenModalAction } from '../../../states/routing/actions';
import { getContactValueTemplate, getFormattedNumberFromTask, getNumberFromTask } from '../../../utils';
import { getPermissionsForViewingIdentifiers, PermissionActions } from '../../../permissions';
import { CustomITask, isTwilioTask } from '../../../types/types';
import { selectCounselorsHash } from '../../../states/configuration/selectCounselorsHash';
import selectPreviousContactCounts from '../../../states/search/selectPreviousContactCounts';

type OwnProps = {
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const PreviousContactsBanner: React.FC<Props> = ({
  previousContactCounts,
  task,
  viewPreviousContacts,
  searchContacts,
  searchCases,
  openContactSearchResults,
}) => {
  let localizedSourceFromTask: { [channelType in ChannelTypes]: string };

  if (isTwilioTask(task)) {
    localizedSourceFromTask = {
      [channelTypes.web]: `${getContactValueTemplate(task)}`,
      [channelTypes.voice]: 'PreviousContacts-PhoneNumber',
      [channelTypes.sms]: 'PreviousContacts-PhoneNumber',
      [channelTypes.whatsapp]: 'PreviousContacts-WhatsappNumber',
      [channelTypes.facebook]: 'PreviousContacts-FacebookUser',
      [channelTypes.twitter]: 'PreviousContacts-TwitterUser',
      [channelTypes.instagram]: 'PreviousContacts-InstagramUser',
      [channelTypes.line]: 'PreviousContacts-LineUser',
    };
  }

  const { canView } = getPermissionsForViewingIdentifiers();
  const maskIdentifiers = !canView(PermissionActions.VIEW_IDENTIFIERS);

  let contactNumber: ReturnType<typeof getFormattedNumberFromTask>;
  if (isTwilioTask(task)) {
    contactNumber = getNumberFromTask(task);
  }

  const performSearch = () => {
    const isTraceableNumber = ![null, undefined, '', 'Anonymous'].includes(contactNumber);

    if (isTraceableNumber) {
      const searchParams = { contactNumber };
      searchContacts(searchParams, CONTACTS_PER_PAGE, 0, true);
      searchCases(searchParams, CASES_PER_PAGE, 0, true);
    }
  };

  useEffect(() => {
    if (previousContactCounts !== undefined) return;

    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousContactCounts]);

  // Ugh. The previous contacts count is off by one because we immediately create a contact when a task is created.
  // contacts should really have a status so we can filter out the "active" contact on the db side.
  const contactsCount = previousContactCounts?.contacts || 0;
  const casesCount = previousContactCounts?.cases || 0;

  // We immediately create a contact when a task is created, so we don't want to show the banner
  const shouldDisplayBanner = contactsCount > 0 || casesCount > 0;
  if (!shouldDisplayBanner) return null;

  const handleClickViewRecords = async () => {
    performSearch();
    viewPreviousContacts();
    openContactSearchResults();
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
            <Bold>{contactNumber}</Bold>
          )}
          .{' '}
        </pre>
        <StyledLink underline data-testid="PreviousContacts-ViewRecords" onClick={handleClickViewRecords}>
          <Template code="PreviousContacts-ViewRecords" />
        </StyledLink>
      </YellowBanner>
    </div>
  );
};

PreviousContactsBanner.displayName = 'PreviousContactsBanner';

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const { taskSid } = task;

  return {
    previousContactCounts: selectPreviousContactCounts(state, taskSid),
    counselorsHash: selectCounselorsHash(state),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { task } = ownProps;
  const taskId = task.taskSid;

  return {
    viewPreviousContacts: viewPreviousContactsAction(dispatch)(task),
    searchContacts: searchContactsAction(dispatch)(taskId),
    searchCases: searchCasesAction(dispatch)(taskId),
    openContactSearchResults: () => {
      // We put the form 'under' the search results in the modal stack so the back button takes them to the form without needing custom handlers
      dispatch(newOpenModalAction({ route: 'search', subroute: 'form' }, taskId));
      dispatch(changeRoute({ route: 'search', subroute: 'contact-results', contactsPage: 0, casesPage: 0 }, taskId));
    },
  };
};

export const UnconnectedPreviousContactsBanner = PreviousContactsBanner;
const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(PreviousContactsBanner);
