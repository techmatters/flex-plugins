/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ButtonBase } from '@material-ui/core';
import { Template, Tab as TwilioTab, ITask } from '@twilio/flex-ui';

import ContactPreview from '../ContactPreview';
import { SearchContactResult, SearchContact } from '../../../types/types';
import { Row } from '../../../styles/HrmStyles';
import {
  BackIcon,
  BackText,
  ResultsHeader,
  ListContainer,
  ScrollableList,
  StyledFormControlLabel,
  StyledSwitch,
  SwitchLabel,
  StyledLink,
  StyledTabs,
  StyledSearchTabs,
  StyledSearchText,
  StyledTabLabel,
  StyledFolderIcon,
  BoldText,
} from '../../../styles/search';
import ConnectDialog from '../ConnectDialog';
import Pagination from '../../Pagination';
import * as SearchActions from '../../../states/search/actions';
import { SearchPages, SearchPagesType } from '../../../states/search/types';
import { namespace, searchContactsBase } from '../../../states';

export const CONTACTS_PER_PAGE = 20;

type OwnProps = {
  task: ITask;
  currentIsCaller: boolean;
  results: SearchContactResult;
  onlyDataContacts: boolean;
  handleSelectSearchResult: (contact: SearchContact) => void;
  handleSearch: (offset: number) => void;
  toggleNonDataContacts: () => void;
  handleBack: () => void;
  handleViewDetails: (contact: SearchContact) => void;
  changeSearchPage: (SearchPagesType) => void;
  currentPage: SearchPagesType;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const SearchResults: React.FC<Props> = ({
  currentIsCaller,
  results,
  onlyDataContacts,
  handleSelectSearchResult,
  handleSearch,
  toggleNonDataContacts,
  handleBack,
  handleViewDetails,
  changeSearchPage,
  currentPage,
}) => {
  const [currentContact, setCurrentContact] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [page, setPage] = useState(0);

  const handleCloseDialog = () => {
    setCurrentContact(null);
    setAnchorEl(null);
  };

  const handleConfirmDialog = () => {
    handleSelectSearchResult(currentContact);
  };

  const handleChangePage = newPage => {
    setPage(newPage);
    handleSearch(CONTACTS_PER_PAGE * newPage);
  };

  const handleToggleNonDataContact = () => {
    setPage(0);
    toggleNonDataContacts();
  };

  const handleOpenConnectDialog = contact => e => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setCurrentContact(contact);
  };

  const { contacts, count } = results;
  const pagesCount = Math.ceil(count / CONTACTS_PER_PAGE);

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
        <Row>
          <ButtonBase onClick={handleBack}>
            <BackIcon />
            <BackText>
              <Template code="SearchResultsIndex-Back" />
            </BackText>
          </ButtonBase>
        </Row>
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
          <StyledSearchTabs>
            <StyledSearchText>
              There are&nbsp;
              <BoldText>
                {/* Intentionally we must show the option different at the one currently selected */}
                {`${count} ${currentPage === SearchPages.resultsContacts ? 'cases' : 'contacts'}`}
              </BoldText>
              &nbsp;returned in this search.&nbsp;
            </StyledSearchText>
            <StyledLink onClick={toggleTabs}>
              <Template
                code={
                  // Intentionally we must show the option different at the one currently selected
                  currentPage === SearchPages.resultsContacts
                    ? 'SearchResultsIndex-ViewCases'
                    : 'SearchResultsIndex-ViewContacts'
                }
              />
            </StyledLink>
          </StyledSearchTabs>
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
                key={contact.contactId}
                contact={contact}
                handleOpenConnectDialog={handleOpenConnectDialog(contact)}
                handleViewDetails={() => handleViewDetails(contact)}
              />
            ))}
          {pagesCount > 1 && (
            <Pagination page={page} pagesCount={pagesCount} handleChangePage={handleChangePage} transparent />
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

  return {
    currentPage: taskSearchState.currentPage,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    changeSearchPage: bindActionCreators(SearchActions.changeSearchPage(taskId), dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
