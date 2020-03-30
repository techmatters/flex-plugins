/* eslint-disable no-empty-function */
import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@material-ui/core';
import ChevronLeft from '@material-ui/icons/ChevronLeft';

import { Container, Row } from '../../../Styles/HrmStyles';
import { BackText, ContactDetailsIcon } from '../../../Styles/search';
import { contactType } from '../../../types';
import Details from './Details';

const ChevronLeftIcon = ContactDetailsIcon(ChevronLeft);

const ContactDetails = ({ contact, handleBack }) => (
  <Container>
    <Row>
      <IconButton onClick={handleBack}>
        <ChevronLeftIcon />
      </IconButton>
      <BackText>RETURN TO RESULTS</BackText>
    </Row>
    <Details contact={contact} handleClickCallSummary={() => {}} />
  </Container>
);

ContactDetails.displayName = 'ContactDetails';
ContactDetails.propTypes = {
  contact: contactType.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default ContactDetails;
