import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs } from '@material-ui/core';

/*
 * import TableRow from '@material-ui/core/TableRow';
 * import TableCell from '@material-ui/core/TableCell';
 */

class SearchResultDetails extends Component {
  static displayName = 'SearchResultDetails';

  static propTypes = {
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
    }).isRequired,
  };

  state = {
    tab: 0,
  };

  handleTabChange = (event, tab) => this.setState({ tab });

  render() {
    const body = [];

    body.push(<div>Child Information Details</div>);
    body.push(<div>Issue Categorization Details</div>);
    body.push(<div>Case Information Details</div>);

    return (
      <>
        <Tabs name="tab" value={this.state.tab} onChange={this.handleTabChange} centered>
          <Tab key="childInformation" label="Child Information" />
          <Tab key="issueCategorization" label="Issue Categorization" />
          <Tab key="caseInformation" label="Case Information" />
        </Tabs>
        {body[this.state.tab]}
      </>
    );
  }
}

export default SearchResultDetails;
