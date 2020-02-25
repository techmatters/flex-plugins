import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CheckIcon from '@material-ui/icons/Check';

import { nameType } from '../types';

class SearchResults extends Component {
  static displayName = 'SearchResults';

  static propTypes = {
    results: PropTypes.arrayOf(
      PropTypes.shape({
        contactId: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
        name: nameType.isRequired,
        callType: PropTypes.string.isRequired,
        categories: PropTypes.string.isRequired,
        notes: PropTypes.string.isRequired,
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
      <span
        tabIndex={0}
        role="button"
        onClick={() => this.toggleShowDetails(contactId)}
      >{`${name.firstName} ${name.lastName}`}</span>
    );
  }

  render() {
    return (
      <Paper>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="right">&nbsp;</TableCell>
              <TableCell align="right">Date</TableCell>
              <TableCell align="right">Time</TableCell>
              <TableCell align="right">Child name</TableCell>
              <TableCell align="right">Call type</TableCell>
              <TableCell align="right">Categories</TableCell>
              <TableCell align="right">Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.results.map(result => (
              <>
                <TableRow key={result.contactId}>
                  <TableCell align="right">
                    <CheckIcon />
                  </TableCell>
                  <TableCell align="right">{result.date}</TableCell>
                  <TableCell align="right">{result.time}</TableCell>
                  <TableCell align="right">{this.renderName(result.name, result.contactId)}</TableCell>
                  <TableCell align="right">{result.callType}</TableCell>
                  <TableCell align="right">{result.categories}</TableCell>
                  <TableCell align="right">{result.notes}</TableCell>
                </TableRow>
                {this.state.showDetails[result.contactId] && (
                  <TableRow key={`${result.contactId}-details`}>
                    <TableCell align="right">DETAILS</TableCell>
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
