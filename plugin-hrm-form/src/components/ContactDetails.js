/* eslint-disable no-empty-function */
import React from 'react';
import PropTypes from 'prop-types';

import { Container } from '../Styles/HrmStyles';
import { formType } from '../types';
import SearchResultDetails from './SearchResultDetails';

const ContactDetails = props => (
  <Container>
    <button type="button" onClick={props.handleBack}>
      Back
    </button>
    <SearchResultDetails details={props.contact} handleClickCallSummary={() => {}} />
  </Container>
);

ContactDetails.displayName = 'ContactDetails';
ContactDetails.propTypes = {
  contact: formType.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default ContactDetails;
