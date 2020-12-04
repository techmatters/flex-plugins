import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import TimelineIcon from './TimelineIcon';
import { CaseSectionFont, ViewButton, TimelineRow, TimelineDate, TimelineText } from '../../styles/case';
import { Box, Row } from '../../styles/HrmStyles';
import { taskType, formType } from '../../types';
import CaseAddButton from './CaseAddButton';
import { getActivities } from '../../services/CaseService';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { ContactDetailsSections } from '../common/ContactDetails';
import { getConfig } from '../../HrmFormPlugin';
import { channelTypes } from '../../states/DomainConstants';

const channelsArray = Object.values(channelTypes);

const isConnectedCaseActivity = activity => channelsArray.includes(activity.type);

const sortActivities = activities => activities.sort((a, b) => b.date.localeCompare(a.date));

const Timeline = ({ task, form, caseId, changeRoute, updateTempInfo }) => {
  const [mockedMessage, setMockedMessage] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    /**
     * Gets the activities timeline from current caseId
     * If the case is just being created, adds the case's description as a new activity.
     */
    const getTimeline = async () => {
      const activities = await getActivities(caseId);
      let timelineActivities = sortActivities(activities);

      const isCreatingCase = !timelineActivities.some(isConnectedCaseActivity);

      if (isCreatingCase) {
        const { workerSid } = getConfig();
        const connectCaseActivity = {
          date: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
          type: task.channelType,
          text: form.caseInformation.callSummary,
          twilioWorkerId: workerSid,
        };

        timelineActivities = sortActivities([...timelineActivities, connectCaseActivity]);
      }

      setTimeline(timelineActivities);
    };

    getTimeline();
  }, [form, task, caseId]);

  const handleOnClickView = activity => {
    const { twilioWorkerId } = activity;

    if (activity.type === 'note') {
      const info = {
        note: activity.text,
        counselor: twilioWorkerId,
        date: new Date(activity.date).toLocaleDateString(navigator.language),
      };
      updateTempInfo({ screen: 'view-note', info }, task.taskSid);
      changeRoute({ route: 'new-case', subroute: 'view-note' }, task.taskSid);
    } else if (channelsArray.includes(activity.type)) {
      const detailsExpanded = {
        [ContactDetailsSections.GENERAL_DETAILS]: true,
        [ContactDetailsSections.CALLER_INFORMATION]: false,
        [ContactDetailsSections.CHILD_INFORMATION]: false,
        [ContactDetailsSections.ISSUE_CATEGORIZATION]: false,
        [ContactDetailsSections.CONTACT_SUMMARY]: false,
      };
      const { contactId } = activity;
      const tempInfo = { detailsExpanded, contactId, date: activity.date, counselor: twilioWorkerId };
      updateTempInfo({ screen: 'view-contact', info: tempInfo }, task.taskSid);
      changeRoute({ route: 'new-case', subroute: 'view-contact' }, task.taskSid);
    } else {
      setMockedMessage(<Template code="NotImplemented" />);
    }
  };

  const handleAddNoteClick = () => {
    updateTempInfo({ screen: 'add-note', info: '' }, task.taskSid);
    changeRoute({ route: 'new-case', subroute: 'add-note' }, task.taskSid);
  };

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
          <CaseAddButton templateCode="Case-AddNote" onClick={handleAddNoteClick} />
        </Row>
      </Box>
      {timeline &&
        timeline.length > 0 &&
        timeline.map((activity, index) => {
          const date = new Date(activity.date).toLocaleDateString(navigator.language);
          return (
            <TimelineRow key={index}>
              <TimelineDate>{date}</TimelineDate>
              <TimelineIcon type={activity.type} />
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
  caseId: PropTypes.number.isRequired,
  changeRoute: PropTypes.func.isRequired,
  updateTempInfo: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
  updateTempInfo: bindActionCreators(CaseActions.updateTempInfo, dispatch),
});

export default connect(null, mapDispatchToProps)(Timeline);
