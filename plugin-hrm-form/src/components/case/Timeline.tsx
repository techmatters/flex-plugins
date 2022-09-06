/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { parseISO } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import CallTypeIcon from '../common/icons/CallTypeIcon';
import TimelineIcon from './TimelineIcon';
import {
  CaseSectionFont,
  ViewButton,
  TimelineRow,
  TimelineDate,
  TimelineText,
  TimelineCallTypeIcon,
  CaseDetailsBorder,
} from '../../styles/case';
import { Box, Row } from '../../styles/HrmStyles';
import CaseAddButton from './CaseAddButton';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { ContactDetailsSections } from '../common/ContactDetails';
import { CaseItemEntry, CustomITask } from '../../types/types';
import { isConnectedCaseActivity } from './caseActivities';
import { TaskEntry } from '../../states/contacts/reducer';
import { Activity, NoteActivity, ReferralActivity } from '../../states/case/types';
import { PermissionActions, PermissionActionType } from '../../permissions';
import { NewCaseSubroutes, AppRoutesWithCase, CaseItemAction } from '../../states/routing/types';

type OwnProps = {
  timelineActivities: Activity[];
  contacts: any[];
  can: (action: PermissionActionType) => boolean;
  taskSid: CustomITask['taskSid'];
  form: TaskEntry;
  route: AppRoutesWithCase['route'];
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const Timeline: React.FC<Props> = props => {
  const { can, taskSid, form, changeRoute, updateTempInfo, route, timelineActivities } = props;
  const [mockedMessage, setMockedMessage] = useState(null);

  const handleViewNoteClick = (activity: NoteActivity) => {
    changeRoute({ route, subroute: NewCaseSubroutes.Note, action: CaseItemAction.View, id: activity.id }, taskSid);
  };

  const handleViewReferralClick = (activity: ReferralActivity) => {
    changeRoute({ route, subroute: NewCaseSubroutes.Referral, action: CaseItemAction.View, id: activity.id }, taskSid);
  };

  const handleViewConnectedCaseActivityClick = activity => {
    const { twilioWorkerId } = activity;

    const detailsExpanded = {
      [ContactDetailsSections.GENERAL_DETAILS]: true,
      [ContactDetailsSections.CALLER_INFORMATION]: false,
      [ContactDetailsSections.CHILD_INFORMATION]: false,
      [ContactDetailsSections.ISSUE_CATEGORIZATION]: false,
      [ContactDetailsSections.CONTACT_SUMMARY]: false,
    };
    const contact = props.contacts.find(c => c.id === activity.contactId);
    const tempInfo = {
      detailsExpanded,
      contact,
      createdAt: activity.createdAt,
      timeOfContact: activity.date,
      counselor: twilioWorkerId,
    };
    updateTempInfo({ screen: NewCaseSubroutes.ViewContact, info: { ...tempInfo } }, taskSid);
    changeRoute({ route, subroute: NewCaseSubroutes.ViewContact }, taskSid);
  };

  const handleAddNoteClick = () => {
    updateTempInfo({ screen: NewCaseSubroutes.Note, action: CaseItemAction.Add, info: null }, taskSid);
    changeRoute({ route, subroute: NewCaseSubroutes.Note, action: CaseItemAction.Add }, taskSid);
  };

  const handleAddReferralClick = () => {
    updateTempInfo({ screen: NewCaseSubroutes.Referral, action: CaseItemAction.Add, info: null }, taskSid);
    changeRoute({ route, subroute: NewCaseSubroutes.Referral, action: CaseItemAction.Add }, taskSid);
  };

  /*
   * If case has not been created yet, we should return value from the form.
   * Else If case was already created we should return rawJson value.
   */
  const callType = form?.callType || props.contacts[0]?.rawJson?.callType;

  const handleViewClick = activity => {
    if (activity.type === 'note') {
      handleViewNoteClick(activity);
    } else if (activity.type === 'referral') {
      handleViewReferralClick(activity);
    } else if (isConnectedCaseActivity(activity)) {
      handleViewConnectedCaseActivityClick(activity);
    } else {
      setMockedMessage(<Template code="NotImplemented" />);
    }
  };

  return (
    <CaseDetailsBorder>
      <Box marginTop="25px">
        <Dialog onClose={() => setMockedMessage(null)} open={Boolean(mockedMessage)}>
          <DialogContent>{mockedMessage}</DialogContent>
        </Dialog>
        <Box marginBottom="10px">
          <Row>
            <CaseSectionFont id="Case-TimelineSection-label">
              <Template code="Case-TimelineSection" />
            </CaseSectionFont>
            <Box marginLeft="auto">
              <CaseAddButton
                templateCode="Case-Note"
                onClick={handleAddNoteClick}
                disabled={!can(PermissionActions.ADD_NOTE)}
              />
              <CaseAddButton
                templateCode="Case-Referral"
                onClick={handleAddReferralClick}
                disabled={!can(PermissionActions.ADD_REFERRAL)}
                withDivider
              />
            </Box>
          </Row>
        </Box>
        {timelineActivities &&
          timelineActivities.length > 0 &&
          timelineActivities.map((activity, index) => {
            const date = parseISO(activity.date).toLocaleDateString(navigator.language);
            return (
              <TimelineRow key={index}>
                <TimelineDate>{date}</TimelineDate>
                <TimelineIcon type={isConnectedCaseActivity(activity) ? activity.channel : activity.type} />
                {isConnectedCaseActivity(activity) && (
                  <TimelineCallTypeIcon>
                    <CallTypeIcon callType={callType} fontSize="18px" />
                  </TimelineCallTypeIcon>
                )}
                <TimelineText>{activity?.text}</TimelineText>
                <Box marginLeft="auto" marginRight="5px">
                  <Box marginLeft="auto" marginRight="5px">
                    <ViewButton onClick={() => handleViewClick(activity)}>
                      <Template code="Case-ViewButton" />
                    </ViewButton>
                  </Box>
                </Box>
              </TimelineRow>
            );
          })}
      </Box>
    </CaseDetailsBorder>
  );
};

Timeline.displayName = 'Timeline';

const mapDispatchToProps = dispatch => ({
  changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
  updateTempInfo: bindActionCreators(CaseActions.updateTempInfo, dispatch),
});

const connector = connect(null, mapDispatchToProps);
const connected = connector(Timeline);

export default connected;
