import React from 'react';
import { Template } from '@twilio/flex-ui';
import { CircularProgress, Dialog, DialogContent } from '@material-ui/core';

import CaseListTable from './CaseListTable';
import { CaseListContainer, LoadingContainer } from '../../styles/caseList';
import { getCases } from '../../services/CaseService';

export const CASES_PER_PAGE = 5;

class CaseList extends React.PureComponent {
  static displayName = 'CaseList';

  state = {
    loading: true,
    caseList: [],
    caseCount: 0,
    page: 0,
    mockedMessage: null,
  };

  async componentDidMount() {
    this.fetchCaseList(0);
  }

  fetchCaseList = async page => {
    this.setState({ loading: true });
    const { cases, count } = await getCases(CASES_PER_PAGE, CASES_PER_PAGE * page);
    console.log('HERE HERE HERE');
    console.log(cases, count);
    this.setState({ page, caseList: cases, caseCount: count, loading: false });
  };

  handleChangePage = async page => {
    await this.fetchCaseList(page);
    // this.setState({ page });
  };

  handleMockedMessage = () => this.setState({ mockedMessage: <Template code="NotImplemented" /> });

  closeMockedMessage = () => this.setState({ mockedMessage: null });

  render() {
    return (
      <>
        <Dialog onClose={this.closeMockedMessage} open={this.state.mockedMessage !== null}>
          <DialogContent>{this.state.mockedMessage}</DialogContent>
        </Dialog>
        <CaseListContainer>
          {this.state.loading ? (
            <LoadingContainer>
              <CircularProgress size={50} />
            </LoadingContainer>
          ) : (
            <CaseListTable
              caseList={this.state.caseList}
              caseCount={this.state.caseCount}
              page={this.state.page}
              handleChangePage={this.handleChangePage}
              handleMockedMessage={this.handleMockedMessage}
            />
          )}
        </CaseListContainer>
      </>
    );
  }
}

export default CaseList;
