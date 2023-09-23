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
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Template, Tab as TwilioTab } from '@twilio/flex-ui';

import ContactPreview from '../ContactPreview';
import CasePreview from '../CasePreview';
import { SearchContactResult, SearchCaseResult, HrmServiceContact, Case, CustomITask } from '../../../types/types';
import { Row } from '../../../styles/HrmStyles';
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
  StyledTabLabel,
  StyledFolderIcon,
  StyledResultsHeader,
  EmphasisedText,
  StyledCount,
} from '../../../styles/search';
import Pagination from '../../Pagination';
import SearchResultsBackButton from './SearchResultsBackButton';
import * as SearchActions from '../../../states/search/actions';
import * as CaseActions from '../../../states/case/actions';
import * as RoutingActions from '../../../states/routing/actions';
import { SearchPages, SearchPagesType } from '../../../states/search/types';
import { namespace, searchContactsBase, configurationBase } from '../../../states';
import { getPermissionsForContact, getPermissionsForCase, PermissionActions } from '../../../permissions';

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
  handleViewDetails: (contact: HrmServiceContact) => void;
  changeSearchPage: (SearchPagesType) => void;
  setConnectedCase: (currentCase: Case, taskSid: string) => void;
  currentPage: SearchPagesType;
};

// eslint-disable-next-line no-use-before-define
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
  handleBack,
  handleViewDetails,
  changeSearchPage,
  setConnectedCase,
  currentPage,
  counselorsHash,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const [contactsPage, setContactsPage] = useState(0);
  const [casesPage, setCasesPage] = useState(0);

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
    changeSearchPage(SearchPages.case);
  };

  const { count: contactsCount, contacts } = searchContactsResults;
  const { count: casesCount, cases } = searchCasesResults;
  const contactsPageCount = Math.ceil(contactsCount / CONTACTS_PER_PAGE);
  const casesPageCount = Math.ceil(casesCount / CASES_PER_PAGE);

  const toggleTabs = () => {
    // eslint-disable-next-line no-unused-expressions
    currentPage === SearchPages.resultsContacts
      ? changeSearchPage(SearchPages.resultsCases)
      : changeSearchPage(SearchPages.resultsContacts);
  };

  const tabSelected = tabName => {
    changeSearchPage(tabName);
  };

  return (
    <>
      <ResultsHeader>
        <SearchResultsBackButton text={<Template code="SearchResultsIndex-Back" />} handleBack={handleBack} />
        <Row style={{ justifyContent: 'center' }}>
          <div style={{ width: '300px' }}>
            <StyledTabs
              selectedTabName={currentPage}
              onTabSelected={tabSelected}
              alignment="left"
              keepTabsMounted={false}
            >
              <TwilioTab
                key="SearchResultsIndex-Contacts"
                label={<Template code="SearchResultsIndex-Contacts" />}
                uniqueName={SearchPages.resultsContacts}
              >
                {[]}
              </TwilioTab>
              <TwilioTab
                key="SearchResultsIndex-Cases"
                label={
                  <StyledTabLabel>
                    <StyledFolderIcon />
                    <Template code="SearchResultsIndex-Cases" />
                  </StyledTabLabel>
                }
                uniqueName={SearchPages.resultsCases}
              >
                {[]}
              </TwilioTab>
            </StyledTabs>
          </div>
        </Row>
      </ResultsHeader>
      <ListContainer>
        <ScrollableList>
          <StyledResultsContainer>
            <StyledResultsText data-testid="SearchResultsCount">
              <>
                {/* Intentionally we must show the option different at the one currently selected */}
                {currentPage === SearchPages.resultsContacts ? (
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
                  currentPage === SearchPages.resultsContacts
                    ? 'SearchResultsIndex-ViewCases'
                    : 'SearchResultsIndex-ViewContacts'
                }
              />
            </StyledLink>
          </StyledResultsContainer>
          {currentPage === SearchPages.resultsContacts && (
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
                      handleViewDetails={() => can(PermissionActions.VIEW_CONTACT) && handleViewDetails(contact)}
                    />
                  );
                })}
              {contactsPageCount > 1 && (
                <Pagination
                  page={contactsPage}
                  pagesCount={contactsPageCount}
                  handleChangePage={handleContactsChangePage}
                  transparent
                />
              )}
            </>
          )}
          {currentPage === SearchPages.resultsCases && (
            <>
              <StyledResultsHeader>
                <StyledCount data-testid="CasesCount">
                  {casesCount}{' '}
                  {casesCount === 1 ? (
                    <Template code="PreviousContacts-Case" />
                  ) : (
                    <Template code="SearchResultsIndex-Cases" />
                  )}{' '}
                </StyledCount>
                <StyledFormControlLabel
                  control={
                    <StyledSwitch
                      color="default"
                      size="small"
                      checked={closedCases}
                      onChange={handleToggleClosedCases}
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
                    />
                  );
                })}
              {casesPageCount > 1 && (
                <Pagination
                  page={casesPage}
                  pagesCount={casesPageCount}
                  handleChangePage={handleCasesChangePage}
                  transparent
                />
              )}
            </>
          )}
        </ScrollableList>
      </ListContainer>
    </>
  );
};
SearchResults.displayName = 'SearchResults';

const mapStateToProps = (state, ownProps) => {
  const searchContactsState = state[namespace][searchContactsBase];
  const taskId = ownProps.task.taskSid;
  const taskSearchState = searchContactsState.tasks[taskId];
  const { counselors } = state[namespace][configurationBase];

  return {
    currentPage: taskSearchState.currentPage,
    counselorsHash: counselors.hash,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    changeSearchPage: bindActionCreators(SearchActions.changeSearchPage(taskId), dispatch),
    setConnectedCase: bindActionCreators(CaseActions.setConnectedCase, dispatch),
    changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
