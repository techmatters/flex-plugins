import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import PropTypes from 'prop-types';
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
import { taskType, formType } from '../../types';
import CaseAddButton from './CaseAddButton';
import { getActivities } from '../../services/CaseService';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { ContactDetailsSections } from '../common/ContactDetails';
import { getConfig } from '../../HrmFormPlugin';
import { namespace, routingBase } from '../../states';
import { blankReferral } from '../../types/types';
import { isConnectedCaseActivity } from './caseHelpers';

const sortActivities = activities => activities.sort((a, b) => b.date.localeCompare(a.date));

const Timeline = ({ task, form, caseObj, changeRoute, updateTempInfo, route }) => {
  const [mockedMessage, setMockedMessage] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    /**
     * Gets the activities timeline from current caseId
     * If the case is just being created, adds the case's description as a new activity.
     */
    const getTimeline = async () => {
      const activities = await getActivities(caseObj.id);
      let timelineActivities = sortActivities(activities);

      const isCreatingCase = !timelineActivities.some(isConnectedCaseActivity);

      if (isCreatingCase) {
        const { workerSid } = getConfig();
        const connectCaseActivity = {
          date: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
          type: task.channelType,
          text: form.caseInformation.callSummary,
          twilioWorkerId: workerSid,
          channel: task.channelType === 'default' ? form.contactlessTask.channel : task.channelType,
        };

        timelineActivities = sortActivities([...timelineActivities, connectCaseActivity]);
      }

      setTimeline(timelineActivities);
    };

    getTimeline();
  }, [form, task, caseObj.id]);

  const handleOnClickView = activity => {
    const { twilioWorkerId } = activity;

    if (activity.type === 'note') {
      const info = {
        note: activity.text,
        counselor: twilioWorkerId,
        date: new Date(activity.date).toLocaleDateString(navigator.language),
      };
      updateTempInfo({ screen: 'view-note', info }, task.taskSid);
      changeRoute({ route, subroute: 'view-note' }, task.taskSid);
    } else if (isConnectedCaseActivity(activity)) {
      const detailsExpanded = {
        [ContactDetailsSections.GENERAL_DETAILS]: true,
        [ContactDetailsSections.CALLER_INFORMATION]: false,
        [ContactDetailsSections.CHILD_INFORMATION]: false,
        [ContactDetailsSections.ISSUE_CATEGORIZATION]: false,
        [ContactDetailsSections.CONTACT_SUMMARY]: false,
      };
      const contact = caseObj.connectedContacts.find(c => c.id === activity.contactId);
      const tempInfo = { detailsExpanded, contact, date: activity.date, counselor: twilioWorkerId };
      updateTempInfo({ screen: 'view-contact', info: tempInfo }, task.taskSid);
      changeRoute({ route, subroute: 'view-contact' }, task.taskSid);
    } else {
      setMockedMessage(<Template code="NotImplemented" />);
    }
  };

  const handleAddNoteClick = () => {
    updateTempInfo({ screen: 'add-note', info: '' }, task.taskSid);
    changeRoute({ route, subroute: 'add-note' }, task.taskSid);
  };

  const handleAddReferralClick = () => {
    updateTempInfo({ screen: 'add-referral', info: blankReferral }, task.taskSid);
    changeRoute({ route, subroute: 'add-referral' }, task.taskSid);
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
            <CaseAddButton templateCode="Case-Note" onClick={handleAddNoteClick} />
            <CaseAddButton templateCode="Case-Referral" onClick={handleAddReferralClick} withDivider />
          </Box>
        </Row>
      </Box>
      {timeline &&
        timeline.length > 0 &&
        timeline.map((activity, index) => {
          const date = new Date(activity.date).toLocaleDateString(navigator.language);
          return (
            <TimelineRow key={index}>
              <TimelineDate>{date}</TimelineDate>
              <TimelineIcon type={isConnectedCaseActivity(activity) ? activity.channel : activity.type} />
              {isConnectedCaseActivity(activity) && (
                <TimelineCallTypeIcon>
                  <CallTypeIcon callType={callType} fontSize="18px" />
                </TimelineCallTypeIcon>
              )}
              <TimelineText>{activity.text}</TimelineText>
              <Box marginLeft="auto" marginRight="10px">
                <ViewButton onClick={() => handleOnClickView(activity)}>View</ViewButton>
              </Box>
            </TimelineRow>
          );
        })}
    </Box>
  );
};

Timeline.displayName = 'Timeline';
Timeline.propTypes = {
  task: taskType.isRequired,
  form: formType.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  caseObj: PropTypes.any.isRequired,
  changeRoute: PropTypes.func.isRequired,
  updateTempInfo: PropTypes.func.isRequired,
  route: PropTypes.oneOf(['tabbed-forms', 'new-case', 'select-call-type']).isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  route: state[namespace][routingBase].tasks[ownProps.task.taskSid].route,
});

const mapDispatchToProps = dispatch => ({
  changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
  updateTempInfo: bindActionCreators(CaseActions.updateTempInfo, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
