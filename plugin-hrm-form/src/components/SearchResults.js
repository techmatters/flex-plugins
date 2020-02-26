import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CheckIcon from '@material-ui/icons/Check';

import SearchResultDetails from './SearchResultDetails';

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
      <span tabIndex={0} role="button" onClick={() => this.toggleShowDetails(contactId)}>
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
              <TableCell>&nbsp;</TableCell>
              <TableCell>Date/Time</TableCell>
              <TableCell>Child name</TableCell>
              <TableCell>Customer #</TableCell>
              <TableCell>Call type</TableCell>
              <TableCell>Categories</TableCell>
              <TableCell>Counselor</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.results.map(result => (
              <>
                <TableRow key={result.contactId}>
                  <TableCell>
                    <CheckIcon />
                  </TableCell>
                  <TableCell>{result.overview.dateTime}</TableCell>
                  <TableCell>{this.renderName(result.overview.name, result.contactId)}</TableCell>
                  <TableCell>{result.overview.customerNumber}</TableCell>
                  <TableCell>{result.overview.callType}</TableCell>
                  <TableCell>{result.overview.categories}</TableCell>
                  <TableCell>{result.overview.counselor}</TableCell>
                  <TableCell>{result.overview.notes}</TableCell>
                </TableRow>
                {this.state.showDetails[result.contactId] && (
                  <TableRow>
                    <TableCell colSpan="8">
                      <SearchResultDetails details={result.details} />
                    </TableCell>
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
