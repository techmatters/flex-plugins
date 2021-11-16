/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { parseISO } from 'date-fns';
import { Template, ITask } from '@twilio/flex-ui';
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
} from '../../styles/case';
import { Box, Row } from '../../styles/HrmStyles';
import CaseAddButton from './CaseAddButton';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { ContactDetailsSections } from '../common/ContactDetails';
import { blankReferral, Case as CaseType, CustomITask } from '../../types/types';
import { isConnectedCaseActivity } from './caseHelpers';
import { TaskEntry } from '../../states/contacts/reducer';
import { Activity } from '../../states/case/types';
import { PermissionActions, PermissionActionType } from '../../permissions';
import type { AppRoutesWithCase } from '../../states/routing/types';

type OwnProps = {
  timelineActivities: Activity[];
  can: (action: PermissionActionType) => boolean;
  taskSid: CustomITask['taskSid'];
  form: TaskEntry;
  caseObj: CaseType;
  route: AppRoutesWithCase['route'];
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const Timeline: React.FC<Props> = props => {
  const { can, taskSid, form, caseObj, changeRoute, updateTempInfo, route, timelineActivities } = props;
  const [mockedMessage, setMockedMessage] = useState(null);

  const handleOnClickView = activity => {
    const { twilioWorkerId } = activity;

    if (activity.type === 'note') {
      const info = {
        note: activity.text,
        counselor: twilioWorkerId,
        date: parseISO(activity.date).toISOString(),
      };
      updateTempInfo({ screen: 'view-note', info }, taskSid);
      changeRoute({ route, subroute: 'view-note' }, taskSid);
    } else if (activity.type === 'referral') {
      const info = {
        referral: activity.referral,
        counselor: twilioWorkerId,
        date: parseISO(activity.createdAt).toISOString(),
      };
      updateTempInfo({ screen: 'view-referral', info }, taskSid);
      changeRoute({ route, subroute: 'view-referral' }, taskSid);
    } else if (isConnectedCaseActivity(activity)) {
      const detailsExpanded = {
        [ContactDetailsSections.GENERAL_DETAILS]: true,
        [ContactDetailsSections.CALLER_INFORMATION]: false,
        [ContactDetailsSections.CHILD_INFORMATION]: false,
        [ContactDetailsSections.ISSUE_CATEGORIZATION]: false,
        [ContactDetailsSections.CONTACT_SUMMARY]: false,
      };
      const contact = caseObj.connectedContacts.find(c => c.id === activity.contactId);
      const tempInfo = {
        detailsExpanded,
        contact,
        createdAt: activity.createdAt,
        timeOfContact: activity.date,
        counselor: twilioWorkerId,
      };
      updateTempInfo({ screen: 'view-contact', info: tempInfo }, taskSid);
      changeRoute({ route, subroute: 'view-contact' }, taskSid);
    } else {
      setMockedMessage(<Template code="NotImplemented" />);
    }
  };

  const handleAddNoteClick = () => {
    updateTempInfo({ screen: 'add-note', info: null }, taskSid);
    changeRoute({ route, subroute: 'add-note' }, taskSid);
  };

  const handleAddReferralClick = () => {
    updateTempInfo({ screen: 'add-referral', info: blankReferral }, taskSid);
    changeRoute({ route, subroute: 'add-referral' }, taskSid);
  };

  /*
   * If case has not been created yet, we should return value from the form.
   * Else If case was already created we should return rawJson value.
   */
  const callType = form?.callType || caseObj.connectedContacts[0]?.rawJson?.callType;

  return (
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
              <Box marginLeft="auto" marginRight="10px">
                <ViewButton onClick={() => handleOnClickView(activity)}>
                  <Template code="Case-ViewButton" />
                </ViewButton>
              </Box>
            </TimelineRow>
          );
        })}
    </Box>
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
