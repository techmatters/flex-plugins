/* eslint-disable no-empty-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonBase } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { Container, Row } from '../../../styles/HrmStyles';
import { BackText, BackIcon } from '../../../styles/search';
import { contactType } from '../../../types';
import GeneralContactDetails from '../../ContactDetails';
import ConnectDialog from '../ConnectDialog';

class ContactDetails extends Component {
  static displayName = 'ContactDetails';

  static propTypes = {
    currentIsCaller: PropTypes.bool.isRequired,
    contact: contactType.isRequired,
    detailsExpanded: PropTypes.objectOf(PropTypes.bool).isRequired,
    handleBack: PropTypes.func.isRequired,
    handleSelectSearchResult: PropTypes.func,
    handleMockedMessage: PropTypes.func.isRequired,
    handleExpandDetailsSection: PropTypes.func.isRequired,
  };

  static defaultProps = {
    handleSelectSearchResult: null,
  };

  state = {
    anchorEl: null,
  };

  handleCloseDialog = () => {
    this.setState({ anchorEl: null });
  };

  handleConfirmDialog = () => {
    if (this.props.handleSelectSearchResult) {
      const { contact } = this.props;

      this.props.handleSelectSearchResult(contact);
    }
  };

  handleOpenConnectDialog = e => {
    e.stopPropagation();
    this.setState({ anchorEl: e.currentTarget });
  };

  render() {
    const { contact, detailsExpanded, currentIsCaller } = this.props;

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
              <BackText>
                <Template code="ContactDetailsIndex-Back" />
              </BackText>
            </Row>
          </ButtonBase>
        </Row>
        <GeneralContactDetails
          showActionIcons
          contact={contact}
          detailsExpanded={detailsExpanded}
          handleOpenConnectDialog={this.handleOpenConnectDialog}
          handleMockedMessage={this.props.handleMockedMessage}
          handleExpandDetailsSection={this.props.handleExpandDetailsSection}
        />
      </Container>
    );
  }
}

export default ContactDetails;
