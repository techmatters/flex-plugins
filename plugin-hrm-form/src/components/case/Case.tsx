/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Template, ITask } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CancelIcon from '@material-ui/icons/Cancel';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import { StandaloneITask } from '../StandaloneSearch';
import {
  namespace,
  contactFormsBase,
  connectedCaseBase,
  configurationBase,
  routingBase,
  RootState,
} from '../../states';
import { getConfig } from '../../HrmFormPlugin';
import { saveToHrm, connectToCase, transformCategories } from '../../services/ContactService';
import { cancelCase, updateCase } from '../../services/CaseService';
import { Box, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { CaseContainer, CenteredContainer } from '../../styles/case';
import CaseDetails from './CaseDetails';
import { Menu, MenuItem } from '../menu';
import { formatName } from '../../utils';
import * as SearchActions from '../../states/search/actions';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import Timeline from './Timeline';
import AddNote from './AddNote';
import AddReferral from './AddReferral';
import Households from './Households';
import Perpetrators from './Perpetrators';
import Incidents from './Incidents';
import CaseSummary from './CaseSummary';
import ViewContact from './ViewContact';
import AddHousehold from './AddHousehold';
import AddPerpetrator from './AddPerpetrator';
import AddIncident from './AddIncident';
import ViewNote from './ViewNote';
import ViewHousehold from './ViewHousehold';
import ViewPerpetrator from './ViewPerpetrator';
import ViewIncident from './ViewIncident';
import ViewReferral from './ViewReferral';
import type { HouseholdEntry, PerpetratorEntry, IncidentEntry } from '../../types/types';

const isStandaloneITask = (task): task is StandaloneITask => {
  return task.taskSid === 'standalone-task-sid';
};

type OwnProps = {
  task: ITask | StandaloneITask;
  isCreating?: boolean;
  handleClose?: () => void;
  handleCompleteTask?: (taskSid: string, task: ITask) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const getNameFromContact = contact => {
  if (contact?.rawJson?.childInformation?.name) {
    const { firstName, lastName } = contact.rawJson.childInformation.name;
    return formatName(`${firstName} ${lastName}`);
  }
  return 'Unknown';
};

const getNameFromForm = form => {
  if (form?.childInformation) {
    const { firstName, lastName } = form.childInformation;
    return formatName(`${firstName} ${lastName}`);
  }
  return 'Unknown';
};

// eslint-disable-next-line complexity
const Case: React.FC<Props> = props => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [mockedMessage, setMockedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { route, subroute } = props.routing;

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

    props.changeRoute({ route: 'tabbed-forms', subroute: 'caseInformation' }, task.taskSid);
    props.removeConnectedCase(task.taskSid);
  };

  const handleSaveAndEnd = async () => {
    setLoading(true);

    const { task, form } = props;
    const { connectedCase } = props.connectedCaseState;
    const { hrmBaseUrl, workerSid, helpline, strings } = getConfig();

    // Validating that task isn't a StandaloneITask.
    if (isStandaloneITask(task)) return;

    try {
      const contact = await saveToHrm(task, form, hrmBaseUrl, workerSid, helpline);
      await updateCase(connectedCase.id, { ...connectedCase });
      await connectToCase(hrmBaseUrl, contact.id, connectedCase.id);
      props.handleCompleteTask(task.taskSid, task);
    } catch (error) {
      console.error(error);
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

  // Redirects to the proper view when the user clicks 'Close' button.
  const handleClose = () => {
    props.updateTempInfo(null, props.task.taskSid);
    if (route === 'select-call-type') {
      props.changeRoute({ route: 'select-call-type' }, props.task.taskSid);
    } else if (route === 'new-case') {
      props.changeRoute({ route: 'new-case' }, props.task.taskSid);
    } else {
      props.changeRoute({ route: 'tabbed-forms', subroute: 'search' }, props.task.taskSid);
    }
  };

  const onClickAddHousehold = () => {
    props.updateTempInfo({ screen: 'add-household', info: null }, props.task.taskSid);
    props.changeRoute({ route, subroute: 'add-household' }, props.task.taskSid);
  };

  const onClickAddPerpetrator = () => {
    props.updateTempInfo({ screen: 'add-perpetrator', info: null }, props.task.taskSid);
    props.changeRoute({ route, subroute: 'add-perpetrator' }, props.task.taskSid);
  };

  const onClickAddIncident = () => {
    props.updateTempInfo({ screen: 'add-incident', info: null }, props.task.taskSid);
    props.changeRoute({ route, subroute: 'add-incident' }, props.task.taskSid);
  };

  const onClickViewHousehold = (household: HouseholdEntry) => {
    props.updateTempInfo({ screen: 'view-household', info: household }, props.task.taskSid);
    props.changeRoute({ route, subroute: 'view-household' }, props.task.taskSid);
  };

  const onClickViewPerpetrator = (perpetrator: PerpetratorEntry) => {
    props.updateTempInfo({ screen: 'view-perpetrator', info: perpetrator }, props.task.taskSid);
    props.changeRoute({ route, subroute: 'view-perpetrator' }, props.task.taskSid);
  };

  const onClickViewIncident = (incident: IncidentEntry) => {
    props.updateTempInfo({ screen: 'view-incident', info: incident }, props.task.taskSid);
    props.changeRoute({ route, subroute: 'view-incident' }, props.task.taskSid);
  };

  const onInfoChange = (fieldName, value) => {
    const { connectedCase } = props.connectedCaseState;
    const { info } = connectedCase;
    const newInfo = info ? { ...info, [fieldName]: value } : { [fieldName]: value };
    props.updateCaseInfo(newInfo, props.task.taskSid);
  };

  const onStatusChange = value => {
    props.updateCaseStatus(value, props.task.taskSid);
  };

  /**
   * Setting this flag in the first render.
   */
  const [isEditing, setIsEditing] = useState(
    props.connectedCaseState?.connectedCase && props.connectedCaseState?.connectedCase?.status === 'open',
  );

  if (!props.connectedCaseState) return null;

  const { task, form, counselorsHash } = props;

  const { connectedCase, caseHasBeenEdited } = props.connectedCaseState;

  const getCategories = firstConnectedContact => {
    if (firstConnectedContact?.rawJson?.caseInformation) {
      return firstConnectedContact.rawJson.caseInformation.categories;
    }
    if (form?.categories) {
      const transformedCategories = transformCategories(form.categories);
      return transformedCategories;
    }
    return null;
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { strings } = getConfig();

    try {
      const updatedCase = await updateCase(connectedCase.id, { ...connectedCase });
      props.updateCases(task.taskSid, updatedCase);
      setIsEditing(connectedCase.status === 'open');
    } catch (error) {
      console.error(error);
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <CenteredContainer>
        <CircularProgress size={50} />
      </CenteredContainer>
    );

  const isMockedMessageOpen = Boolean(mockedMessage);

  const firstConnectedContact = connectedCase && connectedCase.connectedContacts && connectedCase.connectedContacts[0];
  const name = firstConnectedContact ? getNameFromContact(firstConnectedContact) : getNameFromForm(form);
  const categories = getCategories(firstConnectedContact);
  const { createdAt, updatedAt, twilioWorkerId, status, info } = connectedCase || {};
  const counselor = counselorsHash[twilioWorkerId];
  const openedDate = new Date(createdAt).toLocaleDateString(navigator.language);
  const lastUpdatedDate = new Date(updatedAt).toLocaleDateString(navigator.language);
  const followUpDate = info && info.followUpDate ? info.followUpDate : '';
  const households = info && info.households ? info.households : [];
  const perpetrators = info && info.perpetrators ? info.perpetrators : [];
  const incidents = info && info.incidents ? info.incidents : [];

  const addScreenProps = { task: props.task, counselor, onClickClose: handleClose };

  switch (subroute) {
    case 'add-note':
      return <AddNote {...addScreenProps} />;
    case 'add-referral':
      return <AddReferral {...addScreenProps} />;
    case 'add-household':
      return <AddHousehold {...addScreenProps} />;
    case 'add-perpetrator':
      return <AddPerpetrator {...addScreenProps} />;
    case 'add-incident':
      return <AddIncident {...addScreenProps} />;
    case 'view-contact':
      return <ViewContact {...addScreenProps} />;
    case 'view-note':
      return <ViewNote {...addScreenProps} />;
    case 'view-household':
      return <ViewHousehold {...addScreenProps} />;
    case 'view-perpetrator':
      return <ViewPerpetrator {...addScreenProps} />;
    case 'view-incident':
      return <ViewIncident {...addScreenProps} />;
    case 'view-referral':
      return <ViewReferral {...addScreenProps} />;
    default:
      return (
        <>
          <CaseContainer>
            <Box marginLeft="25px" marginTop="13px">
              <CaseDetails
                caseId={connectedCase.id}
                name={name}
                status={status}
                isEditing={isEditing}
                counselor={counselor}
                categories={categories}
                openedDate={openedDate}
                lastUpdatedDate={lastUpdatedDate}
                followUpDate={followUpDate}
                handleInfoChange={onInfoChange}
                handleStatusChange={onStatusChange}
              />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <Timeline caseObj={connectedCase} task={task} form={form} status={status} />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <Households
                households={households}
                status={status}
                onClickAddHousehold={onClickAddHousehold}
                onClickView={onClickViewHousehold}
              />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <Perpetrators
                perpetrators={perpetrators}
                status={status}
                onClickAddPerpetrator={onClickAddPerpetrator}
                onClickView={onClickViewPerpetrator}
              />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <Incidents
                incidents={incidents}
                onClickAddIncident={onClickAddIncident}
                onClickView={onClickViewIncident}
                status={status}
              />
            </Box>
            <Box marginLeft="25px" marginTop="25px">
              <CaseSummary task={props.task} readonly={status === 'closed'} />
            </Box>
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
          </CaseContainer>
          <BottomButtonBar>
            {props.isCreating && (
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
            {!props.isCreating && (
              <>
                <Box marginRight="15px">
                  <StyledNextStepButton secondary roundCorners onClick={props.handleClose}>
                    <Template code="BottomBar-Close" />
                  </StyledNextStepButton>
                </Box>
                {isEditing && (
                  <StyledNextStepButton disabled={!caseHasBeenEdited} roundCorners onClick={handleUpdate}>
                    <Template code="BottomBar-Update" />
                  </StyledNextStepButton>
                )}
              </>
            )}
          </BottomButtonBar>
        </>
      );
  }
};

Case.displayName = 'Case';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  form: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid],
  connectedCaseState: state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid],
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  routing: state[namespace][routingBase].tasks[ownProps.task.taskSid],
});

const mapDispatchToProps = {
  changeRoute: RoutingActions.changeRoute,
  removeConnectedCase: CaseActions.removeConnectedCase,
  updateCaseInfo: CaseActions.updateCaseInfo,
  updateTempInfo: CaseActions.updateTempInfo,
  updateCaseStatus: CaseActions.updateCaseStatus,
  updateCases: SearchActions.updateCases,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Case);

export default connected;
