import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CheckIcon from '@material-ui/icons/Check';
import Tooltip from '@material-ui/core/Tooltip';

import SearchResultDetails from './SearchResultDetails';
import { StyledTableCell } from '../Styles/HrmStyles';

class SearchResults extends Component {
  static displayName = 'SearchResults';

  static propTypes = {
    results: PropTypes.arrayOf(
      PropTypes.shape({
        contactId: PropTypes.string.isRequired,
        overview: PropTypes.shape({
          dateTime: PropTypes.string,
          name: PropTypes.string,
          customerNumber: PropTypes.string,
          callType: PropTypes.string,
          categories: PropTypes.string,
          counselor: PropTypes.string,
          notes: PropTypes.string,
        }).isRequired,
        details: PropTypes.shape({
          childInformation: PropTypes.shape({
            firstName: PropTypes.string,
            lastName: PropTypes.string,
            gender: PropTypes.string,
            age: PropTypes.string,
            language: PropTypes.string,
            nationality: PropTypes.string,
            ethnicity: PropTypes.string,
            refugee: PropTypes.bool,
            streetAddress: PropTypes.string,
            city: PropTypes.string,
            stateOrCounty: PropTypes.string,
            postalCode: PropTypes.string,
            phone1: PropTypes.string,
            phone2: PropTypes.string,
          }),
          caseInformation: PropTypes.shape({
            callSummary: PropTypes.string,
            referredTo: PropTypes.string,
            status: PropTypes.string,
            keepConfidential: PropTypes.bool,
            okForCaseWorkerToCall: PropTypes.bool,
            howDidTheChildHearAboutUs: PropTypes.string,
            didYouDiscussRightsWithTheChild: PropTypes.bool,
            didTheChildFeelWeSolvedTheirProblem: PropTypes.bool,
            wouldTheChildRecommendUsToAFriend: PropTypes.bool,
          }),
        }),
      }),
    ).isRequired,
  };

  state = {
    showDetails: {},
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

  renderName(name, contactId) {
    return (
      <span style={{ cursor: 'pointer' }} tabIndex={0} role="button" onClick={() => this.toggleShowDetails(contactId)}>
        {name}
      </span>
    );
  }

  render() {
    if (this.props.results.length === 0) {
      return null;
    }

    return (
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
                    <CheckIcon />
                  </StyledTableCell>
                  <StyledTableCell>{result.overview.dateTime}</StyledTableCell>
                  <StyledTableCell>{this.renderName(result.overview.name, result.contactId)}</StyledTableCell>
                  <StyledTableCell>{result.overview.customerNumber}</StyledTableCell>
                  <StyledTableCell>{result.overview.callType}</StyledTableCell>
                  <StyledTableCell>{result.overview.categories}</StyledTableCell>
                  <StyledTableCell>{result.overview.counselor}</StyledTableCell>
                  <StyledTableCell>
                    <Tooltip title={result.overview.callSummary.substr(0, 200)}>
                      <span>{result.overview.callSummary}</span>
                    </Tooltip>
                  </StyledTableCell>
                </TableRow>
                {this.state.showDetails[result.contactId] && (
                  <TableRow>
                    <StyledTableCell colSpan="8">
                      <SearchResultDetails details={result.details} />
                    </StyledTableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}

export default SearchResults;
