import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Template, withTaskContext } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CircularProgress } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CancelIcon from '@material-ui/icons/Cancel';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import { namespace, contactFormsBase, configurationBase } from '../../states';
import { taskType, formType } from '../../types';
import { getConfig } from '../../HrmFormPlugin';
import { saveToHrm, connectToCase } from '../../services/ContactService';
import { cancelCase, updateCase } from '../../services/CaseService';
import { Box, Container, BottomButtonBar, StyledNextStepButton, Row } from '../../styles/HrmStyles';
import { CaseContainer, CenteredContainer, CaseNumberFont, CaseSectionFont } from '../../styles/case';
import CaseDetails from './CaseDetails';
import { Menu, MenuItem } from '../menu';
import { formatName } from '../../utils';
import { Actions } from '../../states/ContactState';
import CaseAddButton from './CaseAddButton';
import AddNote from './AddNote';

class Case extends Component {
  static displayName = 'Case';

  static propTypes = {
    handleCompleteTask: PropTypes.func.isRequired,
    task: taskType.isRequired,
    form: formType.isRequired,
    counselorsHash: PropTypes.shape({}).isRequired,
    changeRoute: PropTypes.func.isRequired,
    setConnectedCase: PropTypes.func.isRequired,
    temporaryCaseInfo: PropTypes.func.isRequired,
  };

  state = {
    anchorEl: null,
    isMenuOpen: false,
    mockedMessage: null,
    loading: false,
  };

  toggleCaseMenu = e => {
    e.persist();
    this.setState(prevState => ({ anchorEl: e.currentTarget || e.target, isMenuOpen: !prevState.isMenuOpen }));
  };

  handleMockedMessage = () => this.setState({ mockedMessage: <Template code="NotImplemented" />, isMenuOpen: false });

  closeMockedMessage = () => this.setState({ mockedMessage: null });

  handleCancelNewCaseAndClose = async () => {
    const { task, form } = this.props;
    const { connectedCase } = form.metadata;
    await cancelCase(connectedCase.id);

    this.props.changeRoute('tabbed-forms', task.taskSid);
    this.props.setConnectedCase(null, task.taskSid);
  };

  handleSaveAndEnd = async () => {
    this.setState({ loading: true });

    const { task, form } = this.props;
    const { connectedCase } = form.metadata;
    const { hrmBaseUrl, workerSid, helpline, strings } = getConfig();

    try {
      const contact = await saveToHrm(task, form, hrmBaseUrl, workerSid, helpline);
      await updateCase(connectedCase.id, { info: connectedCase.info });
      await connectToCase(hrmBaseUrl, contact.id, connectedCase.id);
      this.props.handleCompleteTask(task.taskSid, task);
    } catch (error) {
      console.error(error);
      window.alert(strings['Error-Backend']);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleClose = () => {
    const { task } = this.props;
    this.props.temporaryCaseInfo(null, task.taskSid);
    this.props.changeRoute('new-case', task.taskSid);
  };

  onClickAddNote = () => this.props.changeRoute('new-case', this.props.task.taskSid, 'add-note');

  render() {
    const { anchorEl, isMenuOpen, mockedMessage, loading } = this.state;
    const { connectedCase, subroute } = this.props.form.metadata;

    if (!connectedCase) return null;

    if (loading)
      return (
        <CenteredContainer>
          <CircularProgress size={50} />
        </CenteredContainer>
      );

    const isMockedMessageOpen = Boolean(mockedMessage);
    const { firstName, lastName } = this.props.form.childInformation.name;
    const name = formatName(`${firstName.value} ${lastName.value}`);
    const { createdAt, twilioWorkerId, status } = connectedCase;
    const counselor = this.props.counselorsHash[twilioWorkerId];
    const date = new Date(createdAt).toLocaleDateString(navigator.language);

    switch (subroute) {
      case 'add-note':
        return <AddNote task={this.props.task} counselor={counselor} onClickClose={this.handleClose} />;
      default:
        return (
          <CaseContainer>
            <Container>
              <CaseNumberFont>
                <Template code="Case-CaseNumber" /> #{connectedCase.id}
              </CaseNumberFont>
              <Box marginLeft="25px" marginTop="13px">
                <CaseDetails name={name} status={status} counselor={counselor} date={date} />
              </Box>
              <Box marginLeft="25px" marginTop="25px">
                <Row>
                  <CaseSectionFont id="Case-TimelineSection-label">
                    <Template code="Case-TimelineSection" />
                  </CaseSectionFont>
                  <CaseAddButton templateCode="Case-AddNote" onClick={this.onClickAddNote} />
                </Row>
              </Box>
            </Container>
            <Dialog onClose={this.closeMockedMessage} open={isMockedMessageOpen}>
              <DialogContent>{mockedMessage}</DialogContent>
            </Dialog>
            <Menu anchorEl={anchorEl} open={isMenuOpen} onClickAway={() => this.setState({ isMenuOpen: false })}>
              <MenuItem
                Icon={AddIcon}
                text={<Template code="BottomBar-AddThisContactToExistingCase" />}
                onClick={this.handleMockedMessage}
              />
              <MenuItem
                red
                Icon={CancelIcon}
                text={<Template code="BottomBar-CancelNewCaseAndClose" />}
                onClick={this.handleCancelNewCaseAndClose}
              />
            </Menu>
            <BottomButtonBar>
              <Box marginRight="15px">
                <StyledNextStepButton secondary roundCorners onClick={this.toggleCaseMenu}>
                  <Template code="BottomBar-Cancel" />
                </StyledNextStepButton>
              </Box>
              <StyledNextStepButton roundCorners onClick={this.handleSaveAndEnd}>
                <Template code="BottomBar-SaveAndEnd" />
              </StyledNextStepButton>
            </BottomButtonBar>
          </CaseContainer>
        );
    }
  }
}

const mapStateToProps = (state, ownProps) => ({
  form: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid],
  counselorsHash: state[namespace][configurationBase].counselors.hash,
});

const mapDispatchToProps = dispatch => ({
  changeRoute: bindActionCreators(Actions.changeRoute, dispatch),
  setConnectedCase: bindActionCreators(Actions.setConnectedCase, dispatch),
  temporaryCaseInfo: bindActionCreators(Actions.temporaryCaseInfo, dispatch),
});

export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(Case));
