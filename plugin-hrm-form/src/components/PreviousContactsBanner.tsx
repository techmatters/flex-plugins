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
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import {
  viewPreviousContacts as viewPreviousContactsAction,
  searchContacts as searchContactsAction,
  searchCases as searchCasesAction,
} from '../states/search/actions';
import { RootState } from '../states';
import { CONTACTS_PER_PAGE, CASES_PER_PAGE } from './search/SearchResults';
import { YellowBanner } from '../styles/previousContactsBanner';
import { Bold } from '../styles/HrmStyles';
import { StyledLink } from '../styles/search';
import { ChannelTypes, channelTypes } from '../states/DomainConstants';
import { changeRoute, newOpenModalAction } from '../states/routing/actions';
import { getFormattedNumberFromTask, getNumberFromTask, getContactValueTemplate } from '../utils';
import { getPermissionsForViewingIdentifiers, PermissionActions } from '../permissions';
import { CustomITask, isTwilioTask } from '../types/types';
import { namespace } from '../states/storeNamespaces';
import { isRouteModal } from '../states/routing/types';
import { getCurrentBaseRoute } from '../states/routing/getRoute';

type OwnProps = {
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const PreviousContactsBanner: React.FC<Props> = ({
  task,
  previousContacts,
  viewPreviousContacts,
  searchContacts,
  searchCases,
  openContactSearchResults,
  modalOpen,
}) => {
  const { canView } = getPermissionsForViewingIdentifiers();
  const maskIdentifiers = !canView(PermissionActions.VIEW_IDENTIFIERS);

  useEffect(() => {
    if (isTwilioTask(task) && previousContacts === undefined) {
      const contactNumber = getNumberFromTask(task);
      const isTraceableNumber = ![null, undefined, '', 'Anonymous'].includes(contactNumber);

      if (isTraceableNumber) {
        const searchParams = { contactNumber };
        searchContacts(searchParams, CONTACTS_PER_PAGE, 0, true);
        searchCases(searchParams, CASES_PER_PAGE, 0, true);
      }
    }
  }, [task, searchContacts, searchCases, previousContacts]);

  const contactsCount = previousContacts?.contacts?.count || 0;
  const casesCount = previousContacts?.cases?.count || 0;
  const shouldDisplayBanner = contactsCount > 0 || casesCount > 0;

  if (!shouldDisplayBanner) return null;

  const handleClickViewRecords = () => {
    viewPreviousContacts();
    openContactSearchResults();
  };

  let localizedSourceFromTask: { [channelType in ChannelTypes]: string };
  let contactIdentifier: string;
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
    contactIdentifier = getFormattedNumberFromTask(task);
  }

  return (
    <div className={modalOpen ? 'editingContact' : ''}>
      <YellowBanner data-testid="PreviousContacts-Container" className="hiddenWhenModalOpen">
        {/* eslint-disable-next-line prettier/prettier */}
      <pre>
          <Template code="PreviousContacts-ThereAre" />
          &nbsp;
          {contactsCount === 1 ? (
            <Bold>
              {contactsCount} <Template code="PreviousContacts-PreviousContact" />
            </Bold>
          ) : (
            <Bold>
              {contactsCount} <Template code="PreviousContacts-PreviousContacts" />
            </Bold>
          )}
          &nbsp;
          <Template code="PreviousContacts-And" />
          &nbsp;
          {casesCount === 1 ? (
            <Bold>
              {casesCount} <Template code="PreviousContacts-Case" />
            </Bold>
          ) : (
            <Bold>
              {casesCount} <Template code="PreviousContacts-Cases" />
            </Bold>
          )}
          &nbsp;
          <Template code="PreviousContacts-From" />
          &nbsp;
          <Template code={localizedSourceFromTask[task.channelType]} />
          &nbsp;
          {maskIdentifiers ? (
            <Bold>
              <Template code="MaskIdentifiers" />
            </Bold>
          ) : (
            <Bold>{contactIdentifier}</Bold>
          )}
          .&nbsp;
        </pre>
        <StyledLink underline data-testid="PreviousContacts-ViewRecords" onClick={handleClickViewRecords}>
          <Template code="PreviousContacts-ViewRecords" />
        </StyledLink>
      </YellowBanner>
    </div>
  );
};

PreviousContactsBanner.displayName = 'PreviousContactsBanner';

const mapStateToProps = (
  { [namespace]: { searchContacts, configuration, activeContacts, routing } }: RootState,
  { task: { taskSid } }: OwnProps,
) => {
  const taskSearchState = searchContacts.tasks[taskSid];
  const { counselors } = configuration;
  const modalOpen = activeContacts.editingContact || isRouteModal(getCurrentBaseRoute(routing, taskSid));

  return {
    previousContacts: taskSearchState.previousContacts,
    counselorsHash: counselors.hash,
    modalOpen,
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
      dispatch(changeRoute({ route: 'search', subroute: 'contact-results' }, taskId));
    },
  };
};

export const UnconnectedPreviousContactsBanner = PreviousContactsBanner;
export default connect(mapStateToProps, mapDispatchToProps)(PreviousContactsBanner);
