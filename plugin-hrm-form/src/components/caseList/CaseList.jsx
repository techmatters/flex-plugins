import React from 'react';
import { Template } from '@twilio/flex-ui';
import { CircularProgress, Dialog, DialogContent } from '@material-ui/core';

import CaseListTable from './CaseListTable';
import { CaseListContainer, LoadingContainer } from '../../styles/caseList';
import { getCases } from '../../services/CaseService';

class CaseList extends React.PureComponent {
  static displayName = 'CaseList';

  state = {
    loading: true,
    caseList: [],
    page: 0,
    mockedMessage: null,
  };

  async componentDidMount() {
    const caseList = await getCases();
    this.setState({ caseList, loading: false });
  }

  handleChangePage = page => {
    this.setState({ page });
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
