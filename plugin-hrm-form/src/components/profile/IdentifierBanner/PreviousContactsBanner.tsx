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

import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import {
  handleSearchFormChange as handleSearchFormChangeAction,
  searchCases as searchCasesAction,
  searchContacts as searchContactsAction,
  viewPreviousContacts as viewPreviousContactsAction,
} from '../../../states/search/actions';
import { RootState } from '../../../states';
import { CASES_PER_PAGE, CONTACTS_PER_PAGE } from '../../search/SearchResults';
import { BannerLink, IconContainer, IdentifierContainer, YellowBannerContainer } from './styles';
import { Bold } from '../../../styles';
import { changeRoute, newOpenModalAction } from '../../../states/routing/actions';
import { getFormattedNumberFromTask, getNumberFromTask } from '../../../utils';
import { getInitializedCan, PermissionActions } from '../../../permissions';
import { CustomITask, isTwilioTask } from '../../../types/types';
import { selectCounselorsHash } from '../../../states/configuration/selectCounselorsHash';
import selectPreviousContactCounts from '../../../states/search/selectPreviousContactCounts';
import selectContactByTaskSid from '../../../states/contacts/selectContactByTaskSid';
import { SearchFormValues } from '../../../states/search/types';
import selectChannelType from '../../../utils/selectChannelType';
import { iconsFromTask } from './iconsFromTask';

type OwnProps = {
  task: CustomITask;
};

type Props = OwnProps & ConnectedProps<typeof connector>;

const PreviousContactsBanner: React.FC<Props> = ({
  previousContactCounts,
  task,
  searchContacts,
  searchCases,
  handleSearchFormChange,
  openContactSearchResults,
  openCaseSearchResults,
  contact,
  searchContext,
}) => {
  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const handleContextSearchFormChange = handleSearchFormChange(searchContext);

  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  let contactNumber: ReturnType<typeof getFormattedNumberFromTask>;
  if (isTwilioTask(task)) {
    contactNumber = getNumberFromTask(task);
  }

  const performSearch = () => {
    const isTraceableNumber = ![null, undefined, '', 'Anonymous'].includes(contactNumber);

    if (isTraceableNumber) {
      const searchParams = { contactNumber };
      searchContacts(searchContext)(searchParams, CONTACTS_PER_PAGE, 0, true);
      searchCases(searchContext)(searchParams, CASES_PER_PAGE, 0, true);
      handleContextSearchFormChange('contactNumber', contactNumber);
    }
  };

  useEffect(() => {
    if (previousContactCounts !== undefined) return;

    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousContactCounts]);

  const contactsCount = previousContactCounts?.contacts || 0;
  const casesCount = previousContactCounts?.cases || 0;

  // We immediately create a contact when a task is created, so we don't want to show the banner
  const shouldDisplayBanner = contactsCount > 0 || casesCount > 0;
  if (!shouldDisplayBanner) return null;

  const handleViewContacts = () => {
    openContactSearchResults(contact.savedContact.id);
  };

  const handleViewCases = () => {
    openCaseSearchResults(contact.savedContact.id);
  };

  return (
    <YellowBannerContainer data-testid="PreviousContacts-Container" className="hiddenWhenModalOpen">
      <IconContainer>{iconsFromTask[selectChannelType(task)]}</IconContainer>
      <IdentifierContainer>
        <Bold>{maskIdentifiers ? <Template code="MaskIdentifiers" /> : contactNumber}</Bold>
      </IdentifierContainer>
      <Template code="PreviousContacts-Has" />
      <BannerLink type="button" onClick={handleViewContacts} data-testid="banner-link-contacts">
        <Bold>
          {contactsCount} <Template code={`PreviousContacts-PreviousContact${contactsCount === 1 ? '' : 's'}`} />
        </Bold>
      </BannerLink>
      {casesCount > 0 && (
        <>
          {contactsCount > 0 && <>&nbsp;</>}
          <div>
            <Template code="PreviousContacts-And" />
            &nbsp;
          </div>
          <BannerLink type="button" onClick={handleViewCases} data-testid="banner-link-cases">
            <Bold>
              {casesCount} <Template code={`PreviousContacts-Case${casesCount === 1 ? '' : 's'}`} />
            </Bold>
          </BannerLink>
        </>
      )}
    </YellowBannerContainer>
  );
};

PreviousContactsBanner.displayName = 'PreviousContactsBanner';

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const { taskSid } = task;
  const contact = selectContactByTaskSid(state, task.taskSid);
  const searchContext = contact!.savedContact ? `contact-${contact.savedContact.id}` : 'root';

  return {
    previousContactCounts: selectPreviousContactCounts(state, taskSid, searchContext),
    counselorsHash: selectCounselorsHash(state),
    contact,
    searchContext,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { task } = ownProps;
  const taskId = task.taskSid;

  return {
    viewPreviousContacts: viewPreviousContactsAction(dispatch)(task),
    searchContacts: (context: string) => searchContactsAction(dispatch)(taskId, context),
    searchCases: (context: string) => searchCasesAction(dispatch)(taskId, context),
    handleSearchFormChange: (context: string) => (key: keyof SearchFormValues, value: string) =>
      dispatch(handleSearchFormChangeAction(taskId, context)(key, value)),
    openContactSearchResults: (contextContactId: string) => {
      // We put the form 'under' the search results in the modal stack so the back button takes them to the form without needing custom handlers
      dispatch(newOpenModalAction({ contextContactId, route: 'search', subroute: 'form' }, taskId));
      dispatch(
        changeRoute(
          { contextContactId, route: 'search', subroute: 'contact-results', contactsPage: 0, casesPage: 0 },
          taskId,
        ),
      );
    },
    openCaseSearchResults: (contextContactId: string) => {
      dispatch(newOpenModalAction({ contextContactId, route: 'search', subroute: 'form' }, taskId));
      dispatch(
        changeRoute(
          { contextContactId, route: 'search', subroute: 'case-results', contactsPage: 0, casesPage: 0 },
          taskId,
        ),
      );
    },
  };
};

export const UnconnectedPreviousContactsBanner = PreviousContactsBanner;
const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(PreviousContactsBanner);
