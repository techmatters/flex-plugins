import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';

import { StyledTableCell } from '../../Styles/HrmStyles';

class SearchResultDetails extends Component {
  static displayName = 'SearchResultDetails';

  static propTypes = {
    details: PropTypes.shape({
      childInformation: PropTypes.shape({
        name: PropTypes.shape({
          firstName: PropTypes.string,
          lastName: PropTypes.string,
        }),
        gender: PropTypes.string,
        age: PropTypes.string,
        language: PropTypes.string,
        nationality: PropTypes.string,
        ethnicity: PropTypes.string,
        location: PropTypes.shape({
          streetAddress: PropTypes.string,
          city: PropTypes.string,
          stateOrCounty: PropTypes.string,
          postalCode: PropTypes.string,
          phone1: PropTypes.string,
          phone2: PropTypes.string,
        }),
        refugee: PropTypes.bool,
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
    handleClickCallSummary: PropTypes.func.isRequired,
  };

  state = {
    tab: 0,
  };

  renderChildInformation(childInformation) {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <StyledTableCell>First Name</StyledTableCell>
            <StyledTableCell>{childInformation.name.firstName}</StyledTableCell>
            <StyledTableCell>Street Address</StyledTableCell>
            <StyledTableCell>{childInformation.location.streetAddress}</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell>Last Name</StyledTableCell>
            <StyledTableCell>{childInformation.name.lastName}</StyledTableCell>
            <StyledTableCell>City</StyledTableCell>
            <StyledTableCell>{childInformation.location.city}</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell>Gender</StyledTableCell>
            <StyledTableCell>{childInformation.gender}</StyledTableCell>
            <StyledTableCell>State/Country</StyledTableCell>
            <StyledTableCell>{childInformation.location.stateOrCounty}</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell>Age</StyledTableCell>
            <StyledTableCell>{childInformation.age}</StyledTableCell>
            <StyledTableCell>Postal Code</StyledTableCell>
            <StyledTableCell>{childInformation.location.postalCode}</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell>Language</StyledTableCell>
            <StyledTableCell>{childInformation.language}</StyledTableCell>
            <StyledTableCell>Phone #1</StyledTableCell>
            <StyledTableCell>{childInformation.location.phone1}</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell>Nationality</StyledTableCell>
            <StyledTableCell>{childInformation.nationality}</StyledTableCell>
            <StyledTableCell>Phone #2</StyledTableCell>
            <StyledTableCell>{childInformation.location.phone2}</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell>Ethnicity</StyledTableCell>
            <StyledTableCell>{childInformation.ethnicity}</StyledTableCell>
            <StyledTableCell>Refugee?</StyledTableCell>
            <StyledTableCell>{childInformation.refugee ? 'Yes' : 'No'}</StyledTableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  renderIssueCategorization(caseInformation) {
    return <div>Issue Categorization Details</div>;
  }

  renderCaseInformation(caseInformation) {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <StyledTableCell>Call Summary</StyledTableCell>
            <StyledTableCell onClick={() => this.props.handleClickCallSummary(caseInformation.callSummary)}>
              <Tooltip title={caseInformation.callSummary.substr(0, 200)}>
                <span>{caseInformation.callSummary}</span>
              </Tooltip>
            </StyledTableCell>
            <StyledTableCell>Referred To</StyledTableCell>
            <StyledTableCell>{caseInformation.referredTo}</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell>Status</StyledTableCell>
            <StyledTableCell>{caseInformation.status}</StyledTableCell>
            <StyledTableCell>Keep Confidential</StyledTableCell>
            <StyledTableCell>{caseInformation.keepConfidential ? 'Yes' : 'No'}</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell>Ok For Case Worker To Call?</StyledTableCell>
            <StyledTableCell>{caseInformation.okForCaseWorkerToCall ? 'Yes' : 'No'}</StyledTableCell>
            <StyledTableCell>How Did The Child Hear About Us?</StyledTableCell>
            <StyledTableCell>{caseInformation.howDidTheChildHearAboutUs}</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell>Did You Discuss Rights With The Child?</StyledTableCell>
            <StyledTableCell>{caseInformation.didYouDiscussRightsWithTheChild ? 'Yes' : 'No'}</StyledTableCell>
            <StyledTableCell>Did The Child Feel We Solved Their Problem?</StyledTableCell>
            <StyledTableCell>{caseInformation.didTheChildFeelWeSolvedTheirProblem ? 'Yes' : 'No'}</StyledTableCell>
          </TableRow>
          <TableRow>
            <StyledTableCell>Would The Child Recommend Us To A Friend?</StyledTableCell>
            <StyledTableCell>{caseInformation.wouldTheChildRecommendUsToAFriend ? 'Yes' : 'No'}</StyledTableCell>
            <StyledTableCell />
            <StyledTableCell />
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  handleTabChange = (event, tab) => this.setState({ tab });

  render() {
    const body = [];

    body.push(this.renderChildInformation(this.props.details.childInformation));
    body.push(this.renderIssueCategorization(this.props.details.caseInformation));
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

// TODO (Gian): Remove this when details are used again
// eslint-disable-next-line import/no-unused-modules
export default SearchResultDetails;
