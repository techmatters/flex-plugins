/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Template, Tab as TwilioTab } from '@twilio/flex-ui';

import ContactPreview from '../ContactPreview';
import CasePreview from '../CasePreview';
import {
  SearchContactResult,
  SearchCaseResult,
  SearchContact,
  Case,
  CustomITask,
  standaloneTaskSid,
} from '../../../types/types';
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
  StyledContactResultsHeader,
  StyledCaseResultsHeader,
  BoldText,
  StyledCount,
} from '../../../styles/search';
import ConnectDialog from '../ConnectDialog';
import Pagination from '../../Pagination';
import SearchResultsBackButton from './SearchResultsBackButton';
import * as SearchActions from '../../../states/search/actions';
import * as CaseActions from '../../../states/case/actions';
import * as RoutingActions from '../../../states/routing/actions';
import { SearchPages, SearchPagesType } from '../../../states/search/types';
import { namespace, searchContactsBase, configurationBase, contactFormsBase } from '../../../states';

export const CONTACTS_PER_PAGE = 20;
export const CASES_PER_PAGE = 20;

type OwnProps = {
  task: CustomITask;
  currentIsCaller: boolean;
  searchContactsResults: SearchContactResult;
  searchCasesResults: SearchCaseResult;
  onlyDataContacts: boolean;
  closedCases: boolean;
  handleSelectSearchResult?: (contact: SearchContact) => void;
  handleSearchContacts: (offset: number) => void;
  handleSearchCases: (offset: number) => void;
  toggleNonDataContacts: () => void;
  toggleClosedCases: () => void;
  handleBack: () => void;
  handleViewDetails: (contact: SearchContact) => void;
  changeSearchPage: (SearchPagesType) => void;
  setConnectedCase: (currentCase: Case, taskSid: string) => void;
  currentPage: SearchPagesType;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const SearchResults: React.FC<Props> = ({
  task,
  currentIsCaller,
  searchContactsResults,
  searchCasesResults,
  onlyDataContacts,
  closedCases,
  handleSelectSearchResult,
  handleSearchContacts,
  handleSearchCases,
  toggleNonDataContacts,
  toggleClosedCases,
  handleBack,
  handleViewDetails,
  changeSearchPage,
  setConnectedCase,
  changeRoute,
  currentPage,
  showConnectIcon,
  counselorsHash,
  isCallTypeCaller,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const [currentContact, setCurrentContact] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [contactsPage, setContactsPage] = useState(0);
  const [casesPage, setCasesPage] = useState(0);

  const handleCloseDialog = () => {
    setCurrentContact(null);
    setAnchorEl(null);
  };

  const handleConfirmDialog = () => {
    if (handleSelectSearchResult) {
      handleSelectSearchResult(currentContact);
    }
  };

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

  const handleOpenConnectDialog = contact => e => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setCurrentContact(contact);
  };

  const handleClickViewCase = currentCase => () => {
    setConnectedCase(currentCase, task.taskSid, false);
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
            <StyledTabs selectedTabName={currentPage} onTabSelected={tabSelected}>
              <TwilioTab
                label={<Template code="SearchResultsIndex-Contacts" />}
                uniqueName={SearchPages.resultsContacts}
              >
                {[]}
              </TwilioTab>
              <TwilioTab
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
      <ConnectDialog
        task={task}
        anchorEl={anchorEl}
        currentIsCaller={currentIsCaller}
        contact={currentContact}
        handleConfirm={handleConfirmDialog}
        handleClose={handleCloseDialog}
        isCallTypeCaller={isCallTypeCaller}
      />
      <ListContainer>
        <ScrollableList>
          <StyledResultsContainer>
            <StyledResultsText>
              <BoldText data-testid="SearchResultsCount">
                {/* Intentionally we must show the option different at the one currently selected */}
                {currentPage === SearchPages.resultsContacts ? (
                  <>
                    {casesCount === 1 ? (
                      <>
                        <Template code="PreviousContacts-ThereIs" />
                        &nbsp;
                        {casesCount} <Template code="PreviousContacts-Case" />
                      </>
                    ) : (
                      <>
                        <Template code="PreviousContacts-ThereAre" />
                        &nbsp;
                        {casesCount} <Template code="PreviousContacts-Cases" />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {contactsCount === 1 ? (
                      <>
                        <Template code="PreviousContacts-ThereIs" />
                        &nbsp;
                        {contactsCount} <Template code="PreviousContacts-Contact" />
                      </>
                    ) : (
                      <>
                        <Template code="PreviousContacts-ThereAre" />
                        &nbsp;
                        {contactsCount} <Template code="PreviousContacts-Contacts" />
                      </>
                    )}
                  </>
                )}
              </BoldText>
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
              <StyledContactResultsHeader>
                <StyledCount data-testid="ContactsCount">
                  {contactsCount}&nbsp;
                  {contactsCount === 1 ? (
                    <Template code="PreviousContacts-Contact" />
                  ) : (
                    <Template code="SearchResultsIndex-Contacts" />
                  )}
                </StyledCount>
                <StyledFormControlLabel
                  control={<StyledSwitch checked={!onlyDataContacts} onChange={handleToggleNonDataContact} />}
                  label={
                    <SwitchLabel>
                      <Template code="SearchResultsIndex-NonDataContacts" />
                    </SwitchLabel>
                  }
                  labelPlacement="start"
                />
              </StyledContactResultsHeader>
              {contacts &&
                contacts.length > 0 &&
                contacts.map(contact => (
                  <ContactPreview
                    showConnectIcon={showConnectIcon}
                    key={contact.contactId}
                    contact={contact}
                    handleOpenConnectDialog={handleOpenConnectDialog(contact)}
                    handleViewDetails={() => handleViewDetails(contact)}
                  />
                ))}
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
              <StyledCaseResultsHeader>
                <StyledCount data-testid="CasesCount">
                  {casesCount}{' '}
                  {casesCount === 1 ? (
                    <Template code="PreviousContacts-Case" />
                  ) : (
                    <Template code="SearchResultsIndex-Cases" />
                  )}{' '}
                </StyledCount>
                <StyledFormControlLabel
                  control={<StyledSwitch checked={closedCases} onChange={handleToggleClosedCases} />}
                  label={
                    <SwitchLabel>
                      <Template code="SearchResultsIndex-ClosedCases" />
                    </SwitchLabel>
                  }
                  labelPlacement="start"
                />
              </StyledCaseResultsHeader>

              {cases &&
                cases.length > 0 &&
                cases.map(cas => (
                  <CasePreview
                    key={cas.id}
                    currentCase={cas}
                    counselorsHash={counselorsHash}
                    onClickViewCase={handleClickViewCase(cas)}
                  />
                ))}
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
  const isStandaloneSearch = taskId === standaloneTaskSid;
  const { counselors } = state[namespace][configurationBase];
  const { isCallTypeCaller } = state[namespace][contactFormsBase];

  return {
    currentPage: taskSearchState.currentPage,
    showConnectIcon: !isStandaloneSearch,
    counselorsHash: counselors.hash,
    isCallTypeCaller,
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
