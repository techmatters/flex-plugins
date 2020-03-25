import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CheckIcon from '@material-ui/icons/Check';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';

import SearchResultDetails from './SearchResultDetails';
import { Container, StyledTableCell, StyledLabel } from '../Styles/HrmStyles';
import { searchResultType } from '../types';

class SearchResults extends Component {
  static displayName = 'SearchResults';

  static propTypes = {
    results: PropTypes.arrayOf(searchResultType).isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
    handleBack: PropTypes.func.isRequired,
    handleViewDetails: PropTypes.func.isRequired,
  };

  state = {
    showDetails: {},
    selectedCallSumary: '',
  };

  toggleShowDetails(contactId) {
    this.setState(prevState => {
      const showDetails = {
        ...prevState.showDetails,
        [contactId]: !prevState.showDetails[contactId],
      };

      return { showDetails };
    });
  }

  closeDialog = () => this.setState({ selectedCallSumary: '' });

  handleClickCallSummary = selectedCallSumary => this.setState({ selectedCallSumary });

  renderName(name, currentContact) {
    const { handleViewDetails } = this.props;

    return (
      <span style={{ cursor: 'pointer' }} tabIndex={0} role="button" onClick={() => handleViewDetails(currentContact)}>
        {name}
      </span>
    );
  }

  renderCallSummaryDialog() {
    const isOpen = Boolean(this.state.selectedCallSumary);

    return (
      <Dialog onClose={this.closeDialog} open={isOpen}>
        <DialogTitle id="simple-dialog-title">Call Summary</DialogTitle>
        <DialogContent>{this.state.selectedCallSumary}</DialogContent>
      </Dialog>
    );
  }

  render() {
    return (
      <Container>
        <button type="button" onClick={this.props.handleBack}>
          Back
        </button>
        {this.renderCallSummaryDialog()}
        <StyledLabel style={{ marginTop: 30, marginBottom: 10 }}>Use existing contact</StyledLabel>
        <Paper>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableCell>&nbsp;</StyledTableCell>
                <StyledTableCell>Date/Time</StyledTableCell>
                <StyledTableCell>Child name</StyledTableCell>
                <StyledTableCell>Customer #</StyledTableCell>
                <StyledTableCell>Call type</StyledTableCell>
                <StyledTableCell>Categories</StyledTableCell>
                <StyledTableCell>Counselor</StyledTableCell>
                <StyledTableCell>Call Summary</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.results.map(result => (
                <>
                  <TableRow key={result.contactId}>
                    <StyledTableCell>
                      <CheckIcon
                        style={{ cursor: 'pointer' }}
                        onClick={() => this.props.handleSelectSearchResult(result)}
                      />
                    </StyledTableCell>
                    <StyledTableCell>{result.overview.dateTime}</StyledTableCell>
                    <StyledTableCell>{this.renderName(result.overview.name, result.details)}</StyledTableCell>
                    <StyledTableCell>{result.overview.customerNumber}</StyledTableCell>
                    <StyledTableCell>{result.overview.callType}</StyledTableCell>
                    <StyledTableCell>{result.overview.categories}</StyledTableCell>
                    <StyledTableCell>{result.overview.counselor}</StyledTableCell>
                    <StyledTableCell onClick={() => this.handleClickCallSummary(result.overview.notes)}>
                      <Tooltip title={result.overview.notes && result.overview.notes.substr(0, 200)}>
                        <span>{result.overview.notes}</span>
                      </Tooltip>
                    </StyledTableCell>
                  </TableRow>
                  {this.state.showDetails[result.contactId] && (
                    <TableRow>
                      <StyledTableCell colSpan="8">
                        <SearchResultDetails
                          details={result.details}
                          handleClickCallSummary={this.handleClickCallSummary}
                        />
                      </StyledTableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    );
  }
}

export default SearchResults;
