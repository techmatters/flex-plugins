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

type SearchResultsProps = {
  currentIsCaller: boolean;
  results: SearchContactResult;
  handleSelectSearchResult: (contact) => void;
  handleBack: () => void;
  handleViewDetails: (contact) => void;
};

const SearchResults: React.FC<SearchResultsProps> = ({
  currentIsCaller,
  results,
  handleSelectSearchResult,
  handleBack,
  handleViewDetails,
}) => {
  const [currentContact, setCurrentContact] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleCloseDialog = () => {
    setCurrentContact(null);
    setAnchorEl(null);
  };

  const handleConfirmDialog = () => {
    handleSelectSearchResult(currentContact);
  };

  const handleOpenConnectDialog = contact => e => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setCurrentContact(contact);
  };
  console.log({ results });

  const { contacts } = results;
  const resultsCount = contacts.length;

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
          <Pagination page={2} pagesCount={100} handleChangePage={() => null} transparent />
        </ScrollableList>
      </ListContainer>
    </>
  );
};
SearchResults.displayName = 'SearchResults';

export default SearchResults;
