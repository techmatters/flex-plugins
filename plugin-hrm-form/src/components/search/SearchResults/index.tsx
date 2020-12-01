/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Template, Tab as TwilioTab, ITask } from '@twilio/flex-ui';

import { standaloneTaskSid } from '../../../states/ContactState';
import ContactPreview from '../ContactPreview';
import CasePreview from '../CasePreview';
import { SearchContactResult, SearchCaseResult, SearchContact, Case } from '../../../types/types';
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
  BoldText,
} from '../../../styles/search';
import ConnectDialog from '../ConnectDialog';
import Pagination from '../../Pagination';
import SearchResultsBackButton from './SearchResultsBackButton';
import * as SearchActions from '../../../states/search/actions';
import * as CaseActions from '../../../states/case/actions';
import { SearchPages, SearchPagesType } from '../../../states/search/types';
import { namespace, searchContactsBase } from '../../../states';

export const CONTACTS_PER_PAGE = 20;
export const CASES_PER_PAGE = 20;

type OwnProps = {
  task: ITask;
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
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

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
  currentPage,
  showConnectIcon,
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
            <StyledTabs selectedTabName={currentPage} onTabSelected={tabSelected}>
              <TwilioTab label="Contacts" uniqueName={SearchPages.resultsContacts}>
                {[]}
              </TwilioTab>
              <TwilioTab
                label={
                  <StyledTabLabel>
                    <StyledFolderIcon />
                    Cases
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
        anchorEl={anchorEl}
        currentIsCaller={currentIsCaller}
        contact={currentContact}
        handleConfirm={handleConfirmDialog}
        handleClose={handleCloseDialog}
      />
      <ListContainer>
        <ScrollableList>
          <StyledResultsContainer>
            <StyledResultsText>
              There are&nbsp;
              <BoldText data-testid="SearchResultsCount">
                {/* Intentionally we must show the option different at the one currently selected */}
                {currentPage === SearchPages.resultsContacts
                  ? `${casesCount ? casesCount : 0} cases`
                  : `${contactsCount ? contactsCount : 0} contacts`}
              </BoldText>
              &nbsp;returned in this search.&nbsp;
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
              <StyledFormControlLabel
                control={<StyledSwitch checked={!onlyDataContacts} onChange={handleToggleNonDataContact} />}
                label={
                  <SwitchLabel>
                    <Template code="SearchResultsIndex-NonDataContacts" />
                  </SwitchLabel>
                }
                labelPlacement="start"
              />
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
              <StyledFormControlLabel
                control={<StyledSwitch checked={closedCases} onChange={handleToggleClosedCases} />}
                label={
                  <SwitchLabel>
                    <Template code="SearchResultsIndex-ClosedCases" />
                  </SwitchLabel>
                }
                labelPlacement="start"
              />
              {cases &&
                cases.length > 0 &&
                cases.map(cas => (
                  <CasePreview key={cas.id} currentCase={cas} onClickViewCase={handleClickViewCase(cas)} />
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

  return {
    currentPage: taskSearchState.currentPage,
    showConnectIcon: !isStandaloneSearch,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    changeSearchPage: bindActionCreators(SearchActions.changeSearchPage(taskId), dispatch),
    setConnectedCase: bindActionCreators(CaseActions.setConnectedCase, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
