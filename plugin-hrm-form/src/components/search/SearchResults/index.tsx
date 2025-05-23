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
import { bindActionCreators } from 'redux';
import { Tab as TwilioTab, Template } from '@twilio/flex-ui';
import InfoIcon from '@material-ui/icons/Info';

import ContactPreview from '../ContactPreview';
import CasePreview from '../CasePreview';
import { Contact, CustomITask, SearchCaseResult, SearchContactResult } from '../../../types/types';
import { Row } from '../../../styles';
import {
  NoResultTextLink,
  ResultsHeader,
  ResultsSubheader,
  SearchResultWarningContainer,
  StyledFormControlLabel,
  StyledResultsHeader,
  StyledSwitch,
  StyledTabs,
  SwitchLabel,
  Text,
} from '../styles';
import Pagination from '../../pagination';
import { getInitializedCan, PermissionActions } from '../../../permissions';
import { namespace } from '../../../states/storeNamespaces';
import { RootState } from '../../../states';
import { getCurrentTopmostRouteForTask } from '../../../states/routing/getRoute';
import * as RoutingActions from '../../../states/routing/actions';
import { changeRoute, newOpenModalAction } from '../../../states/routing/actions';
import { AppRoutes, ChangeRouteMode, SearchResultRoute, isCaseRoute } from '../../../states/routing/types';
import { recordBackendError } from '../../../fullStory';
import { hasTaskControl } from '../../../transfer/transferTaskState';
import { getUnsavedContact } from '../../../states/contacts/getUnsavedContact';
import { getHrmConfig, getTemplateStrings } from '../../../hrmConfig';
import { createCaseAsyncAction } from '../../../states/case/saveCase';
import asyncDispatch from '../../../states/asyncDispatch';
import { SearchResultsQueryTemplate } from './SearchResultsQueryTemplate';

export const CONTACTS_PER_PAGE = 20;
export const CASES_PER_PAGE = 20;

type OwnProps = {
  task: CustomITask;
  searchContactsResults: SearchContactResult;
  searchCasesResults: SearchCaseResult;
  onlyDataContacts: boolean;
  closedCases: boolean;
  handleSearchContacts: (offset: number) => void;
  handleSearchCases: (offset: number) => void;
  toggleNonDataContacts: () => void;
  toggleClosedCases: () => void;
  handleBack: () => void;
  saveUpdates: () => Promise<void>;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
const SearchResults: React.FC<Props> = ({
  task,
  searchContactsResults,
  searchCasesResults,
  onlyDataContacts,
  closedCases,
  handleSearchContacts,
  handleSearchCases,
  toggleNonDataContacts,
  toggleClosedCases,
  viewContactDetails,
  changeCaseResultPage,
  changeContactResultPage,
  viewCaseDetails,
  newCase,
  counselorsHash,
  routing,
  isRequestingCases,
  isRequestingContacts,
  caseRefreshRequired,
  contactRefreshRequired,
  openModal,
  contact,
  saveUpdates,
  createCaseAsyncAction,
  closeModal,
  contextContactId,
  searchContext,
}) => {
  const { subroute: currentResultPage, casesPage, contactsPage } = routing as SearchResultRoute;

  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const strings = getTemplateStrings();

  useEffect(() => {
    if (contactRefreshRequired) {
      handleSearchContacts(CONTACTS_PER_PAGE * contactsPage);
    }
    if (caseRefreshRequired) {
      handleSearchCases(CASES_PER_PAGE * casesPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactRefreshRequired, caseRefreshRequired, handleSearchContacts, casesPage, contactsPage]);

  if (routing.route !== 'search' || (routing.subroute !== 'case-results' && routing.subroute !== 'contact-results')) {
    return null;
  }
  const setContactsPage = (page: number) => changeContactResultPage(page, routing);
  const setCasesPage = (page: number) => changeCaseResultPage(page, routing);

  const handleContactsChangePage = newPage => {
    setContactsPage(newPage);
    handleSearchContacts(CONTACTS_PER_PAGE * newPage);
  };

  const handleCasesChangePage = newPage => {
    setCasesPage(newPage);
    handleSearchCases(CASES_PER_PAGE * newPage);
  };

  const handleToggleNonDataContact = () => {
    setContactsPage(0);
    toggleNonDataContacts();
  };

  const handleToggleClosedCases = () => {
    setCasesPage(0);
    toggleClosedCases();
  };

  const handleClickViewCase = currentCase => {
    viewCaseDetails(currentCase.id, contextContactId);
  };

  const { count: contactsCount, contacts } = searchContactsResults;
  const { count: casesCount, cases } = searchCasesResults;
  const contactsPageCount = Math.ceil(contactsCount / CONTACTS_PER_PAGE);
  const casesPageCount = Math.ceil(casesCount / CASES_PER_PAGE);

  const tabSelected = tabName => {
    if (tabName === 'contact-results') {
      changeContactResultPage(contactsPage, routing);
    } else {
      changeCaseResultPage(casesPage, routing);
    }
  };

  const openSearchModal = () => {
    if (routing.action) {
      openModal({ route: 'search', subroute: 'form', action: 'select-case' });
    } else {
      openModal({ route: 'search', subroute: 'form' });
    }
  };

  const handleOpenNewCase = async () => {
    const { workerSid, definitionVersion } = getHrmConfig();

    if (!hasTaskControl(task)) return;

    try {
      await saveUpdates();
      await createCaseAsyncAction(contact, workerSid, definitionVersion);
      closeModal();
      newCase();
    } catch (error) {
      recordBackendError('Open New Case', error);
      window.alert(strings['Error-Backend']);
    }
  };

  const caseResults = () => (
    <>
      <StyledResultsHeader key="case-header">
        <SearchResultsQueryTemplate
          task={task}
          searchContext={searchContext}
          subroute={routing.subroute}
          casesCount={casesCount}
          contactsCount={contactsCount}
          counselorsHash={counselorsHash}
        />
        <StyledFormControlLabel
          control={
            <StyledSwitch
              color="default"
              size="small"
              checked={closedCases}
              onChange={handleToggleClosedCases}
              disabled={isRequestingContacts}
            />
          }
          label={
            <SwitchLabel>
              <Template code="SearchResultsIndex-ClosedCases" />
            </SwitchLabel>
          }
          labelPlacement="start"
        />
      </StyledResultsHeader>

      {cases &&
        cases.length > 0 &&
        cases.map(cas => {
          return (
            <CasePreview
              key={cas.id}
              currentCase={cas}
              counselorsHash={counselorsHash}
              onClickViewCase={() => {
                if (can(PermissionActions.VIEW_CASE, cas)) {
                  handleClickViewCase(cas);
                }
              }}
              task={task}
            />
          );
        })}
      {casesPageCount > 1 && (
        <Pagination
          page={casesPage}
          pagesCount={casesPageCount}
          handleChangePage={handleCasesChangePage}
          transparent
          disabled={isRequestingCases}
        />
      )}
    </>
  );

  const contactResults = () => (
    <>
      <StyledResultsHeader key="contact-header">
        <SearchResultsQueryTemplate
          task={task}
          searchContext={searchContext}
          subroute={routing.subroute}
          casesCount={casesCount}
          contactsCount={contactsCount}
          counselorsHash={counselorsHash}
        />
        <StyledFormControlLabel
          control={
            <StyledSwitch
              color="default"
              size="small"
              checked={!onlyDataContacts}
              onChange={handleToggleNonDataContact}
              disabled={isRequestingContacts}
            />
          }
          label={
            <SwitchLabel>
              <Template code="SearchResultsIndex-NonDataContacts" />
            </SwitchLabel>
          }
          labelPlacement="start"
        />
      </StyledResultsHeader>
      {contacts &&
        contacts.length > 0 &&
        contacts.map(contact => {
          return (
            <ContactPreview
              key={contact.id}
              contact={contact}
              handleViewDetails={() => can(PermissionActions.VIEW_CONTACT, contact) && viewContactDetails(contact)}
            />
          );
        })}
      {contactsPageCount > 1 && (
        <Pagination
          page={contactsPage}
          pagesCount={contactsPageCount}
          handleChangePage={handleContactsChangePage}
          transparent
          disabled={isRequestingContacts}
        />
      )}
    </>
  );

  const noResultsTemplateCode =
    currentResultPage === 'contact-results' ? 'SearchResultsIndex-NoContactsFound' : 'SearchResultsIndex-NoCasesFound';
  const searchAgainTemplateCode =
    currentResultPage === 'contact-results'
      ? 'SearchResultsIndex-SearchAgainForContact'
      : 'SearchResultsIndex-SearchAgainForCase';

  const handleNoSearchResult = () => (
    <>
      <div style={{ padding: '0 20px' }}>
        <SearchResultsQueryTemplate
          task={task}
          searchContext={searchContext}
          subroute={routing.subroute}
          casesCount={casesCount}
          contactsCount={contactsCount}
          counselorsHash={counselorsHash}
        />
      </div>
      <SearchResultWarningContainer
        data-testid={currentResultPage === 'contact-results' ? 'ContactsCount' : 'CasesCount'}
      >
        <Row style={{ paddingTop: '20px' }}>
          <InfoIcon style={{ color: '#ffc811' }} />
          <Text padding="0" fontWeight="700" margin="20px" color="#282a2b">
            <Template code={noResultsTemplateCode} />
          </Text>
        </Row>

        <Row>
          <NoResultTextLink
            margin="44px"
            decoration="underline"
            color="#1976D2"
            cursor="pointer"
            onClick={openSearchModal}
          >
            <Template code={searchAgainTemplateCode} />
          </NoResultTextLink>
          {routing.action && (
            <>
              <Text>
                <Template code="SearchResultsIndex-Or" />
              </Text>
              <NoResultTextLink decoration="underline" color="#1976D2" cursor="pointer" onClick={handleOpenNewCase}>
                <Template code="SearchResultsIndex-SaveToNewCase" />
              </NoResultTextLink>
            </>
          )}
        </Row>
      </SearchResultWarningContainer>
    </>
  );

  const handleCaseResultsSearch = () => (cases.length === 0 ? handleNoSearchResult() : caseResults());

  return (
    <>
      {routing.action === 'select-case' ? (
        handleCaseResultsSearch()
      ) : (
        <>
          <ResultsHeader>
            <Row style={{ justifyContent: 'center', width: '100%' }}>
              <StyledTabs
                selectedTabName={currentResultPage}
                onTabSelected={tabSelected}
                alignment="center"
                keepTabsMounted={false}
              >
                <TwilioTab
                  key="SearchResultsIndex-Contacts"
                  label={
                    <>
                      <Template code="SearchResultsIndex-Contacts" /> ({contactsCount})
                    </>
                  }
                  uniqueName="contact-results"
                >
                  {[]}
                </TwilioTab>
                <TwilioTab
                  key="SearchResultsIndex-Cases"
                  label={
                    <>
                      <Template code="SearchResultsIndex-Cases" /> ({casesCount})
                    </>
                  }
                  uniqueName="case-results"
                >
                  {[]}
                </TwilioTab>
              </StyledTabs>
            </Row>
          </ResultsHeader>
          <ResultsSubheader>
            {currentResultPage === 'contact-results' &&
              contacts &&
              (contacts.length === 0 ? handleNoSearchResult() : contactResults())}
            {currentResultPage === 'case-results' &&
              cases &&
              (cases.length === 0 ? handleNoSearchResult() : caseResults())}
          </ResultsSubheader>
        </>
      )}
    </>
  );
};
SearchResults.displayName = 'SearchResults';

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const { searchContacts, configuration, routing, activeContacts } = state[namespace];
  const taskId = task.taskSid;
  const currentRoute = getCurrentTopmostRouteForTask(routing, taskId);
  const contextContactId =
    (isCaseRoute(currentRoute) || currentRoute.route === 'search') && currentRoute.contextContactId;
  const searchContext = contextContactId ? `contact-${contextContactId}` : 'root';
  const { isRequesting, isRequestingCases, caseRefreshRequired, contactRefreshRequired } =
    searchContacts?.tasks[taskId][searchContext] || {};
  const { counselors } = configuration;
  const { draftContact, savedContact } = activeContacts.existingContacts[searchContext] ?? {};

  return {
    isRequestingContacts: isRequesting,
    isRequestingCases,
    caseRefreshRequired,
    contactRefreshRequired,
    counselorsHash: counselors.hash,
    routing: getCurrentTopmostRouteForTask(routing, taskId),
    searchCase: searchContacts.tasks[task.taskSid].searchExistingCaseStatus,
    contact: getUnsavedContact(savedContact, draftContact),
    searchContext,
    contextContactId,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    changeContactResultPage: (contactsPage: number, currentRoute: SearchResultRoute) => {
      dispatch(
        changeRoute({ ...currentRoute, subroute: 'contact-results', contactsPage }, taskId, ChangeRouteMode.Replace),
      );
    },
    changeCaseResultPage: (casesPage: number, currentRoute: SearchResultRoute) => {
      dispatch(changeRoute({ ...currentRoute, subroute: 'case-results', casesPage }, taskId, ChangeRouteMode.Replace));
    },
    viewCaseDetails: (caseId: string, contextContactId: string) => {
      dispatch(
        newOpenModalAction({ contextContactId, route: 'case', subroute: 'home', isCreating: false, caseId }, taskId),
      );
    },
    newCase: () => {
      dispatch(newOpenModalAction({ route: 'case', subroute: 'home', isCreating: true, caseId: undefined }, taskId));
    },
    viewContactDetails: ({ id }: Contact) => {
      dispatch(newOpenModalAction({ route: 'contact', subroute: 'view', id: id.toString() }, taskId));
    },
    changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
    openModal: (route: AppRoutes) => dispatch(RoutingActions.newOpenModalAction(route, taskId)),
    closeModal: () => dispatch(RoutingActions.newCloseModalAction(taskId)),
    createCaseAsyncAction: async (contact, workerSid: string, definitionVersion: string) => {
      // Deliberately using dispatch rather than asyncDispatch here, because we still handle the error from where the action is dispatched.
      // TODO: Rework error handling to be based on redux state set by the _REJECTED action
      await asyncDispatch(dispatch)(createCaseAsyncAction(contact, workerSid, definitionVersion));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
