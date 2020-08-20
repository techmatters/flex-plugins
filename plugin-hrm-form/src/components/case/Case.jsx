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

import { namespace, contactFormsBase, connectedCaseBase, configurationBase, routingBase } from '../../states';
import { taskType, formType } from '../../types';
import { getConfig } from '../../HrmFormPlugin';
import { saveToHrm, connectToCase } from '../../services/ContactService';
import { cancelCase, updateCase } from '../../services/CaseService';
import { Box, Container, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { CaseContainer, CenteredContainer, CaseNumberFont } from '../../styles/case';
import CaseDetails from './CaseDetails';
import { Menu, MenuItem } from '../menu';
import { formatName } from '../../utils';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import Timeline from './Timeline';
import AddNote from './AddNote';
import Households from './Households';
import Perpetrators from './Perpetrators';
import CaseSummary from './CaseSummary';
import ViewContact from './ViewContact';
import AddHousehold from './AddHousehold';
import AddPerpetrator from './AddPerpetrator';
import ViewNote from './ViewNote';
import ViewHousehold from './ViewHousehold';
import ViewPerpetrator from './ViewPerpetrator';

class Case extends Component {
  static displayName = 'Case';

  static propTypes = {
    handleCompleteTask: PropTypes.func.isRequired,
    task: taskType.isRequired,
    form: formType.isRequired,
    connectedCaseState: PropTypes.shape({
      connectedCase: PropTypes.shape({
        id: PropTypes.number,
        createdAt: PropTypes.string,
        twilioWorkerId: PropTypes.string,
        status: PropTypes.string,
        info: PropTypes.shape({
          households: PropTypes.arrayOf(PropTypes.shape({})),
          perpetrators: PropTypes.arrayOf(PropTypes.shape({})),
        }),
      }),
    }).isRequired,
    counselorsHash: PropTypes.shape({}).isRequired,
    changeRoute: PropTypes.func.isRequired,
    removeConnectedCase: PropTypes.func.isRequired,
    updateTempInfo: PropTypes.func.isRequired,
    routing: PropTypes.shape({ subroute: PropTypes.string }).isRequired,
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
    const { task } = this.props;
    const { connectedCase } = this.props.connectedCaseState;
    await cancelCase(connectedCase.id);

    this.props.changeRoute({ route: 'tabbed-forms' }, task.taskSid);
    this.props.removeConnectedCase(task.taskSid);
  };

  handleSaveAndEnd = async () => {
    this.setState({ loading: true });

    const { task, form } = this.props;
    const { connectedCase } = this.props.connectedCaseState;
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
    this.props.updateTempInfo(null, task.taskSid);
    this.props.changeRoute({ route: 'new-case' }, task.taskSid);
  };

  onClickAddHousehold = () =>
    this.props.changeRoute({ route: 'new-case', subroute: 'add-household' }, this.props.task.taskSid);

  onClickAddPerpetrator = () =>
    this.props.changeRoute({ route: 'new-case', subroute: 'add-perpetrator' }, this.props.task.taskSid);

  onClickViewHousehold = household => {
    this.props.updateTempInfo(household, this.props.task.taskSid);
    this.props.changeRoute({ route: 'new-case', subroute: 'view-household' }, this.props.task.taskSid);
  };

  onClickViewPerpetrator = perpetrator => {
    this.props.updateTempInfo(perpetrator, this.props.task.taskSid);
    this.props.changeRoute({ route: 'new-case', subroute: 'view-perpetrator' }, this.props.task.taskSid);
  };

  render() {
    const { anchorEl, isMenuOpen, mockedMessage, loading } = this.state;
    const { subroute } = this.props.routing;

    if (!this.props.connectedCaseState) return null;

    const { task, form, counselorsHash } = this.props;

    const { connectedCase } = this.props.connectedCaseState;

    if (loading)
      return (
        <CenteredContainer>
          <CircularProgress size={50} />
        </CenteredContainer>
      );

    const isMockedMessageOpen = Boolean(mockedMessage);
    const { firstName, lastName } = form.childInformation.name;
    const name = formatName(`${firstName.value} ${lastName.value}`);
    const { createdAt, twilioWorkerId, status, info } = connectedCase;
    const counselor = counselorsHash[twilioWorkerId];
    const date = new Date(createdAt).toLocaleDateString(navigator.language);
    const households = info && info.households ? info.households : [];
    const perpetrators = info && info.perpetrators ? info.perpetrators : [];

    const addScreenProps = { task: this.props.task, counselor, onClickClose: this.handleClose };

    switch (subroute) {
      case 'add-note':
        return <AddNote {...addScreenProps} />;
      case 'add-household':
        return <AddHousehold {...addScreenProps} />;
      case 'add-perpetrator':
        return <AddPerpetrator {...addScreenProps} />;
      case 'view-contact':
        return <ViewContact task={this.props.task} />;
      case 'view-note':
        return <ViewNote taskSid={this.props.task.taskSid} />;
      case 'view-household':
        return <ViewHousehold task={this.props.task} onClickClose={this.handleClose} />;
      case 'view-perpetrator':
        return <ViewPerpetrator task={this.props.task} onClickClose={this.handleClose} />;
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
                <Timeline caseId={connectedCase.id} task={task} form={form} />
              </Box>
              <Box marginLeft="25px" marginTop="25px">
                <Households
                  households={households}
                  onClickAddHousehold={this.onClickAddHousehold}
                  onClickView={this.onClickViewHousehold}
                />
              </Box>
              <Box marginLeft="25px" marginTop="25px">
                <Perpetrators
                  perpetrators={perpetrators}
                  onClickAddPerpetrator={this.onClickAddPerpetrator}
                  onClickView={this.onClickViewPerpetrator}
                />
              </Box>
              <Box marginLeft="25px" marginTop="25px">
                <CaseSummary task={this.props.task} />
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
  connectedCaseState: state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid],
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  routing: state[namespace][routingBase].tasks[ownProps.task.taskSid],
});

const mapDispatchToProps = dispatch => ({
  changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
  removeConnectedCase: bindActionCreators(CaseActions.removeConnectedCase, dispatch),
  updateTempInfo: bindActionCreators(CaseActions.updateTempInfo, dispatch),
});

export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(Case));
