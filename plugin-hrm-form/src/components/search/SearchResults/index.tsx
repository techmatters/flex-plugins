/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { ButtonBase } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import ContactPreview from '../ContactPreview';
import { SearchContactResult } from '../../../types/types';
import { Row } from '../../../styles/HrmStyles';
import { BackIcon, BackText, ResultsHeader, ListContainer, ScrollableList } from '../../../styles/search';
import ConnectDialog from '../ConnectDialog';
import Pagination from '../../Pagination';

export const CONTACTS_PER_PAGE = 10;

type SearchResultsProps = {
  currentIsCaller: boolean;
  results: SearchContactResult;
  handleSelectSearchResult: (contact) => void;
  handleSearch: (offset) => void;
  handleBack: () => void;
  handleViewDetails: (contact) => void;
};

const SearchResults: React.FC<SearchResultsProps> = ({
  currentIsCaller,
  results,
  handleSelectSearchResult,
  handleSearch,
  handleBack,
  handleViewDetails,
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

  const handleOpenConnectDialog = contact => e => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setCurrentContact(contact);
  };

  const { contacts, count } = results;
  const resultsCount = contacts.length;
  const pagesCount = Math.ceil(count / CONTACTS_PER_PAGE);

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
        <Row style={{ paddingLeft: '24px' }}>
          <BackText>
            {resultsCount}
            {resultsCount === 1 ? (
              <Template code="SearchResultsIndex-Result" />
            ) : (
              <Template code="SearchResultsIndex-Results" />
            )}
          </BackText>
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
          {contacts.map(contact => (
            <ContactPreview
              key={contact.contactId}
              contact={contact}
              handleOpenConnectDialog={handleOpenConnectDialog(contact)}
              handleViewDetails={() => handleViewDetails(contact)}
            />
          ))}
          <Pagination page={page} pagesCount={pagesCount} handleChangePage={handleChangePage} transparent />
        </ScrollableList>
      </ListContainer>
    </>
  );
};
SearchResults.displayName = 'SearchResults';

export default SearchResults;
