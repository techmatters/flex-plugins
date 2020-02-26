import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

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

  renderChildInformationDetails(childInformation) {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>First Name</TableCell>
            <TableCell>{childInformation.firstName}</TableCell>
            <TableCell>Street Address</TableCell>
            <TableCell>{childInformation.streetAddress}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Name</TableCell>
            <TableCell>{childInformation.lastName}</TableCell>
            <TableCell>City</TableCell>
            <TableCell>{childInformation.city}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Gender</TableCell>
            <TableCell>{childInformation.gender}</TableCell>
            <TableCell>State/Country</TableCell>
            <TableCell>{childInformation.stateOrCountry}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Age</TableCell>
            <TableCell>{childInformation.age}</TableCell>
            <TableCell>Postal Code</TableCell>
            <TableCell>{childInformation.postalCode}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Language</TableCell>
            <TableCell>{childInformation.language}</TableCell>
            <TableCell>Phone #1</TableCell>
            <TableCell>{childInformation.phone1}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Nationality</TableCell>
            <TableCell>{childInformation.nationality}</TableCell>
            <TableCell>Phone #2</TableCell>
            <TableCell>{childInformation.phone2}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Ethnicity</TableCell>
            <TableCell>{childInformation.ethnicity}</TableCell>
            <TableCell>Refugee?</TableCell>
            <TableCell>{childInformation.refugee ? 'Yes' : 'No'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  renderCaseInformation(caseInformation) {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Call Summary</TableCell>
            <TableCell>{caseInformation.callSummary}</TableCell>
            <TableCell>Referred To</TableCell>
            <TableCell>{caseInformation.referredTo}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>{caseInformation.status}</TableCell>
            <TableCell>Keep Confidential</TableCell>
            <TableCell>{caseInformation.keepConfidential ? 'Yes' : 'No'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Ok For Case Worker To Call?</TableCell>
            <TableCell>{caseInformation.okForCaseWorkerToCall ? 'Yes' : 'No'}</TableCell>
            <TableCell>How Did The Child Hear About Us?</TableCell>
            <TableCell>{caseInformation.howDidTheChildHearAboutUs}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Did You Discuss Rights With The Child?</TableCell>
            <TableCell>{caseInformation.didYouDiscussRightsWithTheChild ? 'Yes' : 'No'}</TableCell>
            <TableCell>Did The Child Feel We Solved Their Problem?</TableCell>
            <TableCell>{caseInformation.didTheChildFeelWeSolvedTheirProblem ? 'Yes' : 'No'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Would The Child Recommend Us To A Friend?</TableCell>
            <TableCell>{caseInformation.wouldTheChildRecommendUsToAFriend ? 'Yes' : 'No'}</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  handleTabChange = (event, tab) => this.setState({ tab });

  render() {
    const body = [];

    body.push(this.renderChildInformationDetails(this.props.details.childInformation));
    body.push(<div>Issue Categorization Details</div>);
    body.push(this.renderCaseInformation(this.props.details.caseInformation));

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
