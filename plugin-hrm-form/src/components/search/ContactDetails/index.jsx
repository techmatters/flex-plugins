/* eslint-disable no-empty-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';

import { Container } from '../../../styles/HrmStyles';
import { contactType } from '../../../types';
import GeneralContactDetails from '../../ContactDetails';
import ConnectDialog from '../ConnectDialog';
import BackToSearchResultsButton from '../SearchResults/SearchResultsBackButton';

class ContactDetails extends Component {
  static displayName = 'ContactDetails';

  static propTypes = {
    currentIsCaller: PropTypes.bool.isRequired,
    contact: contactType.isRequired,
    showActionIcons: PropTypes.objectOf(PropTypes.bool).isRequired,
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
    const { contact, detailsExpanded, currentIsCaller, handleBack, showActionIcons } = this.props;

    return (
      <Container>
        <ConnectDialog
          anchorEl={this.state.anchorEl}
          currentIsCaller={currentIsCaller}
          contact={contact}
          handleConfirm={this.handleConfirmDialog}
          handleClose={this.handleCloseDialog}
        />
        <BackToSearchResultsButton
          text={<Template code="SearchResultsIndex-BackToResults" />}
          handleBack={handleBack}
        />
        <GeneralContactDetails
          showActionIcons={showActionIcons}
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
