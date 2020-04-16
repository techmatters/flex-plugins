/* eslint-disable no-empty-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonBase } from '@material-ui/core';

import { Container, Row } from '../../../styles/HrmStyles';
import { BackText, BackIcon } from '../../../styles/search';
import { contactType } from '../../../types';
import Details from './Details';
import ConnectDialog from '../ConnectDialog';

class ContactDetails extends Component {
  static displayName = 'ContactDetails';

  static propTypes = {
    currentIsCaller: PropTypes.bool.isRequired,
    contact: contactType.isRequired,
    handleBack: PropTypes.func.isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
    handleMockedMessage: PropTypes.func.isRequired,
  };

  state = {
    anchorEl: null,
  };

  handleCloseDialog = () => {
    this.setState({ anchorEl: null });
  };

  handleConfirmDialog = () => {
    const { contact } = this.props;
    this.props.handleSelectSearchResult(contact);
  };

  handleClickChain = e => {
    e.stopPropagation();
    this.setState({ anchorEl: e.currentTarget });
  };

  render() {
    const { contact, currentIsCaller } = this.props;

    return (
      <Container>
        <ConnectDialog
          anchorEl={this.state.anchorEl}
          currentIsCaller={currentIsCaller}
          contact={contact}
          handleConfirm={this.handleConfirmDialog}
          handleClose={this.handleCloseDialog}
        />
        <Row>
          <ButtonBase onClick={this.props.handleBack}>
            <Row>
              <BackIcon />
              <BackText>Return to results</BackText>
            </Row>
          </ButtonBase>
        </Row>
        <Details
          contact={contact}
          handleClickChain={this.handleClickChain}
          handleMockedMessage={this.props.handleMockedMessage}
        />
      </Container>
    );
  }
}

export default ContactDetails;
