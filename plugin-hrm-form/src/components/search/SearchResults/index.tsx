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
import { Template, Tab as TwilioTab } from '@twilio/flex-ui';

import ContactPreview from '../ContactPreview';
import CasePreview from '../CasePreview';
import { SearchContactResult, SearchCaseResult, Contact, Case, CustomITask } from '../../../types/types';
import { Box, Row } from '../../../styles/HrmStyles';
import {
  ResultsHeader,
  ListContainer,
  ScrollableList,
  StyledFormControlLabel,
  StyledSwitch,
  SwitchLabel,
  StyledLink,
  StyledTabs,
  StyledResultsContainer,
  StyledResultsText,
  StyledResultsHeader,
  EmphasisedText,
  StyledCount,
} from '../../../styles/search';
import Pagination from '../../Pagination';
import * as CaseActions from '../../../states/case/actions';
import { SearchPagesType } from '../../../states/search/types';
import { getPermissionsForContact, getPermissionsForCase, PermissionActions } from '../../../permissions';
import { namespace } from '../../../states/storeNamespaces';
import { RootState } from '../../../states';
import { getCurrentTopmostRouteForTask } from '../../../states/routing/getRoute';
import { changeRoute, newOpenModalAction } from '../../../states/routing/actions';
import { ChangeRouteMode, SearchResultRoute } from '../../../states/routing/types';

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
  changeSearchPage: (SearchPagesType) => void;
  setConnectedCase: (currentCase: Case, taskSid: string) => void;
  currentPage: SearchPagesType;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
// eslint-disable-next-line complexity
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
  setConnectedCase,
  counselorsHash,
  routing,
  isRequestingCases,
  isRequestingContacts,
  caseRefreshRequired,
  contactRefreshRequired,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const { subroute: currentResultPage, casesPage, contactsPage } = routing as SearchResultRoute;

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

  const handleClickViewCase = currentCase => () => {
    setConnectedCase(currentCase, task.taskSid);
    viewCaseDetails();
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

  const toggleTabs = () => tabSelected(currentResultPage === 'contact-results' ? 'case-selected' : 'contact-selected');

  const caseResults = () => (
    <>
      <StyledResultsHeader>
        <StyledCount data-testid="CasesCount">
          {casesCount}{' '}
          {casesCount === 1 ? <Template code="PreviousContacts-Case" /> : <Template code="SearchResultsIndex-Cases" />}{' '}
        </StyledCount>
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
          const { can } = getPermissionsForCase(cas.twilioWorkerId, cas.status);
          return (
            <CasePreview
              key={cas.id}
              currentCase={cas}
              counselorsHash={counselorsHash}
              onClickViewCase={can(PermissionActions.VIEW_CASE) && handleClickViewCase(cas)}
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

  if (currentResultPage === 'case-results' && routing.action === 'select-case') return caseResults();

  return (
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
                <Box style={{ minWidth: '340px' }}>
                  <Template code="SearchResultsIndex-Contacts" />
                </Box>
              }
              uniqueName="contact-results"
            >
              {[]}
            </TwilioTab>
            <TwilioTab
              key="SearchResultsIndex-Cases"
              label={
                <Box style={{ minWidth: '340px' }}>
                  <Template code="SearchResultsIndex-Cases" />
                </Box>
              }
              uniqueName="case-results"
            >
              {[]}
            </TwilioTab>
          </StyledTabs>
        </Row>
      </ResultsHeader>
      <ListContainer>
        <ScrollableList>
          <StyledResultsContainer>
            <StyledResultsText data-testid="SearchResultsCount">
              <>
                {/* Intentionally we must show the option different at the one currently selected */}
                {currentResultPage === 'contact-results' ? (
                  <>
                    <Template code={casesCount === 1 ? 'PreviousContacts-ThereIs' : 'PreviousContacts-ThereAre'} />
                    &nbsp;
                    <EmphasisedText>
                      {casesCount}{' '}
                      <Template code={casesCount === 1 ? 'PreviousContacts-Case' : 'PreviousContacts-Cases'} />
                    </EmphasisedText>
                  </>
                ) : (
                  <>
                    <Template code={contactsCount === 1 ? 'PreviousContacts-ThereIs' : 'PreviousContacts-ThereAre'} />
                    &nbsp;
                    <EmphasisedText>
                      {contactsCount}{' '}
                      <Template code={contactsCount === 1 ? 'PreviousContacts-Contact' : 'PreviousContacts-Contacts'} />
                    </EmphasisedText>
                  </>
                )}
              </>
              &nbsp;
              <Template code="PreviousContacts-Returned" />
              &nbsp;
            </StyledResultsText>
            <StyledLink onClick={toggleTabs} data-testid="ViewCasesLink">
              <Template
                code={
                  // Intentionally we must show the option different at the one currently selected
                  currentResultPage === 'contact-results'
                    ? 'SearchResultsIndex-ViewCases'
                    : 'SearchResultsIndex-ViewContacts'
                }
              />
            </StyledLink>
          </StyledResultsContainer>
          {currentResultPage === 'contact-results' && (
            <>
              <StyledResultsHeader>
                <StyledCount data-testid="ContactsCount">
                  {contactsCount}&nbsp;
                  {contactsCount === 1 ? (
                    <Template code="PreviousContacts-Contact" />
                  ) : (
                    <Template code="SearchResultsIndex-Contacts" />
                  )}
                </StyledCount>
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
                  const { can } = getPermissionsForContact(contact.twilioWorkerId);
                  return (
                    <ContactPreview
                      key={contact.id}
                      contact={contact}
                      handleViewDetails={() => can(PermissionActions.VIEW_CONTACT) && viewContactDetails(contact)}
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
          )}
          {currentResultPage === 'case-results' && caseResults()}
        </ScrollableList>
      </ListContainer>
    </>
  );
};
SearchResults.displayName = 'SearchResults';

const mapStateToProps = (
  { [namespace]: { searchContacts, configuration, routing, activeContacts } }: RootState,
  { task }: OwnProps,
) => {
  const taskId = task.taskSid;
  const { isRequesting, isRequestingCases, caseRefreshRequired, contactRefreshRequired } = searchContacts.tasks[taskId];
  const { counselors } = configuration;
  const taskContact = activeContacts.existingContacts[taskId]?.savedContact;
  return {
    isRequestingContacts: isRequesting,
    isRequestingCases,
    caseRefreshRequired,
    contactRefreshRequired,
    counselorsHash: counselors.hash,
    routing: getCurrentTopmostRouteForTask(routing, taskId),
    taskContact,
    searchCase: searchContacts.tasks[task.taskSid].searchExistingCaseStatus,
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
    viewCaseDetails: () => {
      dispatch(newOpenModalAction({ route: 'case', subroute: 'home' }, taskId));
    },
    viewContactDetails: ({ id }: Contact) => {
      dispatch(newOpenModalAction({ route: 'contact', subroute: 'view', id: id.toString() }, taskId));
    },
    setConnectedCase: bindActionCreators(CaseActions.setConnectedCase, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
