/* eslint-disable no-empty-function */
import React from 'react';
import PropTypes from 'prop-types';
import { ButtonBase } from '@material-ui/core';

import { Container, Row } from '../../../Styles/HrmStyles';
import { BackText, BackIcon } from '../../../Styles/search';
import { contactType } from '../../../types';
import Details from './Details';

const ContactDetails = ({ contact, handleBack, handleMockedMessage }) => (
  <Container>
    <Row>
      <ButtonBase onClick={handleBack}>
        <Row>
          <BackIcon />
          <BackText>Return to results</BackText>
        </Row>
      </ButtonBase>
    </Row>
    <Details contact={contact} handleMockedMessage={handleMockedMessage} />
  </Container>
);

ContactDetails.displayName = 'ContactDetails';
ContactDetails.propTypes = {
  contact: contactType.isRequired,
  handleBack: PropTypes.func.isRequired,
  handleMockedMessage: PropTypes.func.isRequired,
};

export default ContactDetails;
