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
/* eslint-disable react/no-multi-comp */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import SearchForm from './SearchForm';
import SearchResults, { CASES_PER_PAGE, CONTACTS_PER_PAGE } from './SearchResults';
import ContactDetails from '../contact/ContactDetails';
import Case from '../case';
import ProfileRouter, { isProfileRoute } from '../profile/ProfileRouter';
import { SearchParams } from '../../states/search/types';
import { CustomITask } from '../../types/types';
import {
  handleCreateNewSearchForm,
  handleSearchFormChange,
  searchCases,
  searchContacts,
} from '../../states/search/actions';
import { RootState } from '../../states';
import { namespace } from '../../states/storeNamespaces';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { changeRoute, newCloseModalAction } from '../../states/routing/actions';
import { SearchResultRoute, SearchRoute } from '../../states/routing/types';
import NavigableContainer from '../NavigableContainer';
import selectCasesForSearchResults from '../../states/search/selectCasesForSearchResults';
import selectContactsForSearchResults from '../../states/search/selectContactsForSearchResults';
import { DetailsContext } from '../../states/contacts/contactDetails';
import selectContextContactId from '../../states/contacts/selectContextContactId';

type OwnProps = {
  task: CustomITask;
  currentIsCaller?: boolean;
  contactId?: string;
  saveUpdates?: () => Promise<void>;
};

const mapStateToProps = (state: RootState, { task, contactId }: OwnProps) => {
  const {
    [namespace]: { searchContacts, activeContacts, routing },
  } = state;
  const taskId = task.taskSid;
  const currentRoute = getCurrentTopmostRouteForTask(routing, taskId);
  const contextContactId = selectContextContactId(state, taskId, 'search', 'form');
  const searchRootId =
    currentRoute.route === 'search' && currentRoute.action === 'select-case' ? contextContactId : contactId || 'root';
  const taskSearchState = searchContacts.tasks[taskId][searchRootId];

  return {
    activeContacts,
    isRequesting: taskSearchState?.isRequesting,
    error: taskSearchState?.error,
    form: taskSearchState?.form,
    searchContactsResults: selectContactsForSearchResults(state, taskId, contactId),
    searchCasesResults: selectCasesForSearchResults(state, taskId, contactId),
    routing: currentRoute,
    searchCase: taskSearchState?.searchExistingCaseStatus,
    contextContactId,
    searchRootId,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    handleSearchFormChange: (contactId: string) =>
      bindActionCreators(handleSearchFormChange(taskId, contactId || 'root'), dispatch),
    changeSearchPage: (subroute: SearchResultRoute['subroute'], action?: SearchRoute['action'], contactId?: string) =>
      dispatch(
        changeRoute(
          { route: 'search', subroute, action, casesPage: 0, contactsPage: 0, contextContactId: contactId },
          taskId,
        ),
      ),
    searchContacts: (context: string) => searchContacts(dispatch)(taskId, context),
    searchCases: searchCases(dispatch)(taskId, ownProps.contactId),
    closeModal: () => dispatch(newCloseModalAction(taskId)),
    handleCreateNewSearch: (context: string) => dispatch(handleCreateNewSearchForm(taskId, context)),
  };
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const Search: React.FC<Props> = ({
  task,
  currentIsCaller,
  searchContacts,
  searchCases,
  handleSearchFormChange,
  searchContactsResults,
  searchCasesResults,
  form,
  routing,
  changeSearchPage,
  contactId,
  saveUpdates,
  contextContactId,
  handleCreateNewSearch,
  searchRootId,
}) => {
  const [mockedMessage, setMockedMessage] = useState('');
  const [searchParams, setSearchParams] = useState<any>({});

  useEffect(() => {
    if (!form) {
      handleCreateNewSearch(contextContactId);
    }
  }, [form, contextContactId, handleCreateNewSearch]);

  const closeDialog = () => setMockedMessage('');

  const handleSearchContacts = (newSearchParams: SearchParams, newOffset) =>
    searchContacts(contextContactId)(newSearchParams, CONTACTS_PER_PAGE, newOffset);

  const handleSearchCases = (newSearchParams, newOffset) => searchCases(newSearchParams, CASES_PER_PAGE, newOffset);

  const setSearchParamsAndHandleSearch = async newSearchParams => {
    if (routing.route === 'search' && routing.action === 'select-case') {
      changeSearchPage('case-results', 'select-case', routing.contextContactId);
      await Promise.all([handleSearchCases(newSearchParams, 0)]);
      setSearchParams(newSearchParams);
      return;
    }

    changeSearchPage('contact-results');
    await Promise.all([handleSearchContacts(newSearchParams, 0), handleSearchCases(newSearchParams, 0)]);
    setSearchParams(newSearchParams);
  };

  const setOffsetAndHandleSearchContacts = newOffset => handleSearchContacts(searchParams, newOffset);

  const setOffsetAndHandleSearchCases = newOffset => handleSearchCases(searchParams, newOffset);

  const toggleNonDataContacts = async () => {
    if (typeof searchParams.onlyDataContacts !== 'undefined') {
      const { onlyDataContacts } = searchParams;
      const updatedSearchParams = {
        ...searchParams,
        onlyDataContacts: !onlyDataContacts,
      };

      setSearchParams(updatedSearchParams);
      return handleSearchContacts(updatedSearchParams, 0);
    }
    return undefined;
  };

  const toggleClosedCases = async () => {
    if (typeof searchParams.closedCases !== 'undefined') {
      const { closedCases } = searchParams;
      const updatedSearchParams = {
        ...searchParams,
        closedCases: !closedCases,
      };

      setSearchParams(updatedSearchParams);
      return handleSearchCases(updatedSearchParams, 0);
    }
    return undefined;
  };

  const renderMockDialog = () => {
    const isOpen = Boolean(mockedMessage);

    return (
      <Dialog onClose={closeDialog} open={isOpen}>
        <DialogContent>{mockedMessage}</DialogContent>
      </Dialog>
    );
  };
  renderMockDialog.displayName = 'MockDialog';

  const renderSearchPages = () => {
    if (isProfileRoute(routing)) return <ProfileRouter task={task} />;

    if (!form) return null;

    switch (routing.route) {
      case 'search': {
        if (routing.subroute === 'case-results' || routing.subroute === 'contact-results') {
          return (
            <NavigableContainer
              task={task}
              titleCode={
                routing.action === 'select-case' ? 'SearchResultsIndex-SelectCase' : 'SearchContactsAndCases-Title'
              }
            >
              <SearchResults
                task={task}
                currentIsCaller={currentIsCaller}
                searchContactsResults={searchContactsResults}
                searchCasesResults={searchCasesResults}
                onlyDataContacts={searchParams.onlyDataContacts}
                closedCases={searchParams.closedCases}
                handleSearchContacts={setOffsetAndHandleSearchContacts}
                handleSearchCases={setOffsetAndHandleSearchCases}
                toggleNonDataContacts={toggleNonDataContacts}
                toggleClosedCases={toggleClosedCases}
                contactId={contactId}
                saveUpdates={saveUpdates}
              />
            </NavigableContainer>
          );
        }
        // Fall through to default to render the form
        break;
      }
      case 'case': {
        return <Case task={task} />;
      }
      case 'contact':
        return (
          <ContactDetails
            context={DetailsContext.CONTACT_SEARCH}
            contactId={routing.id}
            task={task}
            data-testid="ContactDetails"
          />
        );
      default:
        break;
    }
    return (
      <NavigableContainer
        task={task}
        titleCode={
          routing.route === 'search' && routing.action === 'select-case'
            ? 'SearchContactsAndCases-TitleExistingCase'
            : 'SearchContactsAndCases-Title'
        }
      >
        <SearchForm
          task={task}
          values={form}
          handleSearchFormChange={handleSearchFormChange(searchRootId)}
          handleSearch={setSearchParamsAndHandleSearch}
        />
      </NavigableContainer>
    );
  };
  renderSearchPages.displayName = 'SearchPage';

  return (
    <>
      {renderMockDialog()}
      {renderSearchPages()}
    </>
  );
};

Search.displayName = 'Search';
Search.defaultProps = {
  currentIsCaller: false,
  error: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
