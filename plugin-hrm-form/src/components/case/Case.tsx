/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Template, withTaskContext, ITask } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CircularProgress } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CancelIcon from '@material-ui/icons/Cancel';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import { namespace, contactFormsBase, connectedCaseBase, configurationBase, routingBase } from '../../states';
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
import { newCallerFormInformation } from '../common/forms';
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

type OwnProps = {
  task: ITask;
  hideEditButtons?: boolean;
  handleClose?: () => void;
  handleCompleteTask?: (taskSid: string, task: ITask) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const Case: React.FC<Props> = props => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [mockedMessage, setMockedMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleCaseMenu = e => {
    e.persist();
    setAnchorEl(e.currentTarget || e.target);
    setMenuOpen(!isMenuOpen);
  };

  const handleMockedMessage = () => {
    setMockedMessage(<Template code="NotImplemented" />);
    setMenuOpen(false);
  };

  const closeMockedMessage = () => setMockedMessage(null);

  const handleCancelNewCaseAndClose = async () => {
    const { task } = props;
    const { connectedCase } = props.connectedCaseState;
    await cancelCase(connectedCase.id);

    props.changeRoute({ route: 'tabbed-forms' }, task.taskSid);
    props.removeConnectedCase(task.taskSid);
  };

  const handleSaveAndEnd = async () => {
    setLoading(true);

    const { task, form } = props;
    const { connectedCase } = props.connectedCaseState;
    const { hrmBaseUrl, workerSid, helpline, strings } = getConfig();

    try {
      const contact = await saveToHrm(task, form, hrmBaseUrl, workerSid, helpline);
      await updateCase(connectedCase.id, { info: connectedCase.info });
      await connectToCase(hrmBaseUrl, contact.id, connectedCase.id);
      props.handleCompleteTask(task.taskSid, task);
    } catch (error) {
      console.error(error);
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    props.updateTempInfo(null, props.task.taskSid);
    props.changeRoute({ route: 'new-case' }, props.task.taskSid);
  };

  const onClickAddHousehold = () => {
    props.updateTempInfo({ screen: 'add-household', info: newCallerFormInformation }, props.task.taskSid);
    props.changeRoute({ route: 'new-case', subroute: 'add-household' }, props.task.taskSid);
  };

  const onClickAddPerpetrator = () => {
    props.updateTempInfo({ screen: 'add-perpetrator', info: newCallerFormInformation }, props.task.taskSid);
    props.changeRoute({ route: 'new-case', subroute: 'add-perpetrator' }, props.task.taskSid);
  };

  const onClickViewHousehold = household => {
    props.updateTempInfo({ screen: 'view-household', info: household }, props.task.taskSid);
    props.changeRoute({ route: 'new-case', subroute: 'view-household' }, props.task.taskSid);
  };

  const onClickViewPerpetrator = perpetrator => {
    props.updateTempInfo({ screen: 'view-perpetrator', info: perpetrator }, props.task.taskSid);
    props.changeRoute({ route: 'new-case', subroute: 'view-perpetrator' }, props.task.taskSid);
  };

  const { subroute } = props.routing;

  if (!props.connectedCaseState) return null;

  const { task, form, counselorsHash } = props;

  const { connectedCase } = props.connectedCaseState;

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

  const addScreenProps = { task: props.task, counselor, onClickClose: handleClose };

  switch (subroute) {
    case 'add-note':
      return <AddNote {...addScreenProps} />;
    case 'add-household':
      return <AddHousehold {...addScreenProps} />;
    case 'add-perpetrator':
      return <AddPerpetrator {...addScreenProps} />;
    case 'view-contact':
      return <ViewContact task={props.task} />;
    case 'view-note':
      return <ViewNote taskSid={props.task.taskSid} />;
    case 'view-household':
      return <ViewHousehold task={props.task} onClickClose={handleClose} />;
    case 'view-perpetrator':
      return <ViewPerpetrator task={props.task} onClickClose={handleClose} />;
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
                onClickAddHousehold={onClickAddHousehold}
                onClickView={onClickViewHousehold}
              />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <Perpetrators
                perpetrators={perpetrators}
                onClickAddPerpetrator={onClickAddPerpetrator}
                onClickView={onClickViewPerpetrator}
              />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <CaseSummary task={props.task} />
            </Box>
          </Container>
          <Dialog onClose={closeMockedMessage} open={isMockedMessageOpen}>
            <DialogContent>{mockedMessage}</DialogContent>
          </Dialog>
          <Menu anchorEl={anchorEl} open={isMenuOpen} onClickAway={() => setMenuOpen(false)}>
            <MenuItem
              Icon={AddIcon}
              text={<Template code="BottomBar-AddThisContactToExistingCase" />}
              onClick={handleMockedMessage}
            />
            <MenuItem
              red
              Icon={CancelIcon}
              text={<Template code="BottomBar-CancelNewCaseAndClose" />}
              onClick={handleCancelNewCaseAndClose}
            />
          </Menu>
          <BottomButtonBar>
            {!props.hideEditButtons && (
              <>
                <Box marginRight="15px">
                  <StyledNextStepButton secondary roundCorners onClick={toggleCaseMenu}>
                    <Template code="BottomBar-Cancel" />
                  </StyledNextStepButton>
                </Box>
                <StyledNextStepButton roundCorners onClick={handleSaveAndEnd}>
                  <Template code="BottomBar-SaveAndEnd" />
                </StyledNextStepButton>
              </>
            )}
            {props.hideEditButtons && (
              <StyledNextStepButton roundCorners onClick={props.handleClose}>
                <Template code="BottomBar-Close" />
              </StyledNextStepButton>
            )}
          </BottomButtonBar>
        </CaseContainer>
      );
  }
};

Case.displayName = 'Case';

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
