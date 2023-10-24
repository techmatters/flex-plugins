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
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import asyncDispatch from '../../states/asyncDispatch';
import {
  viewPreviousContacts as viewPreviousContactsAction,
  searchContacts as searchContactsAction,
  searchCases as searchCasesAction,
} from '../../states/search/actions';
import * as ProfileActions from '../../states/profile/actions';
import * as ProfileSelectors from '../../states/profile/selectors';
import * as ProfileTypes from '../../states/profile/types';
import { RootState } from '../../states';
import { CONTACTS_PER_PAGE, CASES_PER_PAGE } from '../search/SearchResults';
import { YellowBanner } from '../../styles/previousContactsBanner';
import { Bold } from '../../styles/HrmStyles';
import { StyledLink } from '../../styles/search';
import { ChannelTypes, channelTypes } from '../../states/DomainConstants';
import { changeRoute as changeRouteAction } from '../../states/routing/actions';
import { getFormattedNumberFromTask, getNumberFromTask, getContactValueTemplate } from '../../utils';
import { getPermissionsForViewingIdentifiers, PermissionActions } from '../../permissions';
import { CustomITask, isTwilioTask } from '../../types/types';
import { namespace } from '../../states/storeNamespaces';
import { isRouteModal } from '../../states/routing/types';
import { getCurrentBaseRoute } from '../../states/routing/getRoute';

type OwnProps = {
  task: CustomITask;
  enableClientProfiles?: boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const PreviousContactsBanner: React.FC<Props> = ({
  contactIdentifier,
  enableClientProfiles,
  identifierEntry,
  previousContacts,
  task,
  viewPreviousContacts,
  searchContacts,
  searchCases,
  changeRoute,
  loadIdentifierByIdentifier,
  modalOpen,
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

  useEffect(() => {
    const fetchData = () => {
      loadIdentifierByIdentifier(contactIdentifier);
    };
    if (enableClientProfiles && contactIdentifier && !identifierEntry) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactIdentifier]);

  const { canView } = getPermissionsForViewingIdentifiers();
  const maskIdentifiers = !canView(PermissionActions.VIEW_IDENTIFIERS);

  const performSearch = () => {
    if (!isTwilioTask(task)) return;
    const contactNumber = getNumberFromTask(task);
    const isTraceableNumber = ![null, undefined, '', 'Anonymous'].includes(contactNumber);

    if (isTraceableNumber) {
      const searchParams = { contactNumber };
      searchContacts(searchParams, CONTACTS_PER_PAGE, 0, true);
      searchCases(searchParams, CASES_PER_PAGE, 0, true);
    }
  };

  useEffect(() => {
    if (enableClientProfiles) return;
    if (previousContacts !== undefined) return;

    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousContacts]);

  const identifierData = identifierEntry?.data;

  // Ugh. The previous contacts count is off by one because we immediately create a contact when a task is created.
  // contacts should really have a status so we can filter out the "active" contact on the db side.
  const contactsCount = identifierData?.profiles?.[0]?.contactsCount - 1 || previousContacts?.contacts?.count || 0;
  const casesCount = identifierData?.profiles?.[0]?.casesCount || previousContacts?.cases?.count || 0;

  // We immediately create a contact when a task is created, so we don't want to show the banner
  const shouldDisplayBanner = contactsCount > 1 || casesCount > 0;
  if (!shouldDisplayBanner) return null;

  const handleClickViewRecords = async () => {
    if (enableClientProfiles) {
      const { id } = identifierData?.profiles?.[0];
      changeRoute({ route: 'profile', id });
      return;
    }

    viewPreviousContacts();

    const subroute = enableClientProfiles ? 'profile' : 'search';
    changeRoute({ route: 'tabbed-forms', subroute });
  };

  return (
    <div className={modalOpen ? 'editingContact' : ''}>
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
            <Bold>{contactIdentifier}</Bold>
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
  const { profile, searchContacts, routing, activeContacts, configuration } = state[namespace];
  const { taskSid } = task;
  const taskSearchState = searchContacts.tasks[taskSid];
  const { counselors } = configuration;
  const modalOpen = activeContacts.editingContact || isRouteModal(getCurrentBaseRoute(routing, taskSid));

  let contactIdentifier: ProfileTypes.Identifier['identifier'];
  let identifierEntry: ProfileTypes.IdentifierEntry;
  if (isTwilioTask(task)) {
    contactIdentifier = getFormattedNumberFromTask(task);
    identifierEntry = ProfileSelectors.getIdentiferByIdentifier(state, contactIdentifier);
  }

  return {
    previousContacts: taskSearchState.previousContacts,
    counselorsHash: counselors.hash,
    modalOpen,
    contactIdentifier,
    identifierEntry,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { task } = ownProps;
  const taskId = task.taskSid;

  return {
    viewPreviousContacts: viewPreviousContactsAction(dispatch)(task),
    searchContacts: searchContactsAction(dispatch)(taskId),
    searchCases: searchCasesAction(dispatch)(taskId),
    changeRoute: routing => dispatch(changeRouteAction(routing, taskId)),
    loadIdentifierByIdentifier: identifier =>
      asyncDispatch(dispatch)(ProfileActions.loadIdentifierByIdentifierAsync(identifier)),
  };
};

export const UnconnectedPreviousContactsBanner = PreviousContactsBanner;
export default connect(mapStateToProps, mapDispatchToProps)(PreviousContactsBanner);
