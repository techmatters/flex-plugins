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
  newCreateSearchForm,
  handleSearchFormChange,
  searchCases,
  searchContacts,
  generalizedSearchContacts,
  generalizedSearchCases,
  handleSearchFormUpdate,
} from '../../states/search/actions';
import { RootState } from '../../states';
import { namespace } from '../../states/storeNamespaces';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { changeRoute, newCloseModalAction } from '../../states/routing/actions';
import { SearchResultRoute, SearchRoute, isCaseRoute } from '../../states/routing/types';
import NavigableContainer from '../NavigableContainer';
import selectCasesForSearchResults from '../../states/search/selectCasesForSearchResults';
import selectContactsForSearchResults from '../../states/search/selectContactsForSearchResults';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { GeneralizedSearchForm } from './GeneralizedSearchForm';
import { getAseloFeatureFlags } from '../../hrmConfig';

type OwnProps = {
  task: CustomITask;
  currentIsCaller?: boolean;
  saveUpdates?: () => Promise<void>;
};

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const {
    [namespace]: { searchContacts, activeContacts, routing },
  } = state;
  const taskId = task.taskSid;
  const currentRoute = getCurrentTopmostRouteForTask(routing, taskId);
  const contextContactId =
    (isCaseRoute(currentRoute) || currentRoute.route === 'search') && currentRoute.contextContactId;
  const searchContext = contextContactId ? `contact-${contextContactId}` : 'root';
  const taskSearchState = searchContacts.tasks[taskId][searchContext];

  return {
    activeContacts,
    isRequesting: taskSearchState?.isRequesting,
    error: taskSearchState?.error,
    form: taskSearchState?.form,
    searchContactsResults: selectContactsForSearchResults(state, taskId, searchContext),
    searchCasesResults: selectCasesForSearchResults(state, taskId, searchContext),
    routing: currentRoute,
    searchCase: taskSearchState?.searchExistingCaseStatus,
    searchContext,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    handleSearchFormChange: (context: string) => bindActionCreators(handleSearchFormChange(taskId, context), dispatch),
    handleSearchFormUpdate: (context: string) => bindActionCreators(handleSearchFormUpdate(taskId, context), dispatch),
    changeSearchPage: (subroute: SearchResultRoute['subroute'], action?: SearchRoute['action'], contactId?: string) =>
      dispatch(
        changeRoute(
          { route: 'search', subroute, action, casesPage: 0, contactsPage: 0, contextContactId: contactId },
          taskId,
        ),
      ),
    searchContacts: (context: string) => searchContacts(dispatch)(taskId, context),
    searchCases: (context: string) => searchCases(dispatch)(taskId, context),
    generalizedSearchContacts: (context: string) => generalizedSearchContacts(dispatch)(taskId, context),
    generalizedSearchCases: (context: string) => generalizedSearchCases(dispatch)(taskId, context),
    closeModal: () => dispatch(newCloseModalAction(taskId)),
    handleNewCreateSearch: (context: string) => dispatch(newCreateSearchForm(taskId, context)),
  };
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const Search: React.FC<Props> = ({
  task,
  currentIsCaller,
  searchContacts,
  searchCases,
  generalizedSearchContacts,
  generalizedSearchCases,
  handleSearchFormChange,
  handleSearchFormUpdate,
  searchContactsResults,
  searchCasesResults,
  form,
  routing,
  changeSearchPage,
  saveUpdates,
  handleNewCreateSearch,
  searchContext,
}) => {
  const enableGeneralizedSearch = getAseloFeatureFlags().enable_generalized_search;

  const [mockedMessage, setMockedMessage] = useState('');
  const [searchParams, setSearchParams] = useState<any>({});

  useEffect(() => {
    if (!form) {
      handleNewCreateSearch(searchContext);
    }
  }, [form, searchContext, handleNewCreateSearch]);

  const closeDialog = () => setMockedMessage('');

  const handleSearchContacts = (newSearchParams: SearchParams, newOffset) => {
    if (enableGeneralizedSearch) {
      return generalizedSearchContacts(searchContext)(form, CONTACTS_PER_PAGE, newOffset);
    }

    return searchContacts(searchContext)({ ...form, ...newSearchParams }, CONTACTS_PER_PAGE, newOffset);
  };

  const handleSearchCases = (newSearchParams, newOffset) => {
    if (enableGeneralizedSearch) {
      return generalizedSearchCases(searchContext)(form, CONTACTS_PER_PAGE, newOffset);
    }

    return searchCases(searchContext)({ ...form, ...newSearchParams }, CASES_PER_PAGE, newOffset);
  };
  const setSearchParamsAndHandleSearch = async newSearchParams => {
    if (routing.route === 'search') {
      if (routing.subroute === 'form' && routing.action === 'select-case') {
        changeSearchPage('case-results', 'select-case', routing.contextContactId);
        await Promise.all([handleSearchCases(newSearchParams, 0)]);
        setSearchParams(newSearchParams);
        return;
      }
      changeSearchPage('contact-results', undefined, routing.contextContactId);
      await Promise.all([handleSearchContacts(newSearchParams, 0), handleSearchCases(newSearchParams, 0)]);
      setSearchParams(newSearchParams);
    }
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
        noOverflow={enableGeneralizedSearch}
      >
        {enableGeneralizedSearch ? (
          <GeneralizedSearchForm
            initialValues={form}
            task={task}
            handleSearchFormUpdate={handleSearchFormUpdate(searchContext)}
            handleSearch={setSearchParamsAndHandleSearch}
          />
        ) : (
          <SearchForm
            task={task}
            values={form}
            handleSearchFormChange={handleSearchFormChange(searchContext)}
            handleSearch={setSearchParamsAndHandleSearch}
          />
        )}
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
