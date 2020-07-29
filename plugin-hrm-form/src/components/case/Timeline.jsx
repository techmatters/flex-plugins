import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import TimelineIcon from './TimelineIcon';
import { CaseSectionFont, ViewButton } from '../../styles/case';
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
    timeline.push({
      date: format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
      type: task.channelType,
      text: form.caseInformation.callSummary.value,
    });
  }
  return (
    <div style={{ marginTop: '25px' }}>
      <Dialog onClose={() => setMockedMessage(null)} open={Boolean(mockedMessage)}>
        <DialogContent>{mockedMessage}</DialogContent>
      </Dialog>
      <div style={{ marginBottom: '10px' }}>
        <Row>
          <CaseSectionFont id="Case-TimelineSection-label">
            <Template code="Case-TimelineSection" />
          </CaseSectionFont>
          <CaseAddButton templateCode="Case-AddNote" onClick={onClickAddNote} />
        </Row>
      </div>
      {timeline
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((activity, index) => {
          const date = new Date(activity.date).toLocaleDateString(navigator.language);
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F6F6F67D',
                height: '40px',
                marginBottom: '3px',
                padding: '0 15px',
              }}
            >
              <div style={{ fontWeight: 'bold', minWidth: '65px', textAlign: 'center' }}>{date}</div>
              <TimelineIcon type={activity.type} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                {activity.text}
              </span>
              <Box marginLeft="5px">
                <ViewButton onClick={() => setMockedMessage(<Template code="NotImplemented" />)}>View</ViewButton>
              </Box>
            </div>
          );
        })}
    </div>
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
