import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import TimelineIcon from './TimelineIcon';
import { CaseSectionFont, ViewButton, TimelineRow, TimelineDate, TimelineText } from '../../styles/case';
import { Box, Row } from '../../styles/HrmStyles';
import { taskType, formType } from '../../types';
import { isNullOrUndefined } from '../../utils/checkers';
import CaseAddButton from './CaseAddButton';
import { getActivities } from '../../services/CaseService';

const Timeline = ({ task, form, caseId, onClickAddNote }) => {
  const [mockedMessage, setMockedMessage] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    async function updateTimeline() {
      const activities = await getActivities(caseId);
      setTimeline(activities);
    }

    updateTimeline();
  }, [caseId]);

  const isCreatingCase = isNullOrUndefined(
    timeline.find(activity => ['whatsapp', 'facebook', 'web', 'sms'].includes(activity.type)),
  );
  if (isCreatingCase) {
    const connectCaseActivity = {
      date: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
      type: task.channelType,
      text: form.caseInformation.callSummary.value,
    };

    setTimeline([...timeline, connectCaseActivity]);
  }
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
          <CaseAddButton templateCode="Case-AddNote" onClick={onClickAddNote} />
        </Row>
      </Box>
      {timeline
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((activity, index) => {
          const date = new Date(activity.date).toLocaleDateString(navigator.language);
          return (
            <TimelineRow key={index}>
              <TimelineDate>{date}</TimelineDate>
              <TimelineIcon type={activity.type} />
              <TimelineText>{activity.text}</TimelineText>
              <Box marginLeft="auto" marginRight="10px">
                <ViewButton onClick={() => setMockedMessage(<Template code="NotImplemented" />)}>View</ViewButton>
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
  onClickAddNote: PropTypes.func.isRequired,
};

export default Timeline;
