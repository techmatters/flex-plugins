import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import PropTypes from 'prop-types';

import TimelineIcon from './TimelineIcon';
import { CaseSectionFont, ViewButton } from '../../styles/case';
import { Box, Row } from '../../styles/HrmStyles';
import { taskType, formType, caseType } from '../../types';
import { isNullOrUndefined } from '../../utils/checkers';
import CaseAddButton from './CaseAddButton';
import { getActivities } from '../../services/CaseService';

// const timeline = [
//   {
//     date: '2020-07-5 13:27:31',
//     type: 'note',
//     text:
//       'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum in semper purus, ac finibus lacus. Morbi suscipit varius ex eget sodales. Curabitur non mauris ac velit tincidunt sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Suspendisse potenti.',
//   },
//   {
//     date: '2020-03-03 13:27:31',
//     type: 'facebook',
//     text:
//       'Integer ultrices volutpat eros nec pellentesque. Sed vel ante ac orci porta egestas. Integer suscipit pellentesque orci, accumsan auctor leo egestas eget. Fusce tincidunt sollicitudin hendrerit. Quisque volutpat ante tellus, vel rhoncus lectus bibendum ut. Pellentesque a tortor ac mi cursus dapibus aliquet suscipit odio.',
//   },
//   {
//     date: '2020-03-03 13:27:31',
//     type: 'whatsapp',
//     text:
//       'Integer ultrices volutpat eros nec pellentesque. Sed vel ante ac orci porta egestas. Integer suscipit pellentesque orci, accumsan auctor leo egestas eget. Fusce tincidunt sollicitudin hendrerit. Quisque volutpat ante tellus, vel rhoncus lectus bibendum ut. Pellentesque a tortor ac mi cursus dapibus aliquet suscipit odio.',
//   },
//   {
//     date: '2020-03-03 13:27:31',
//     type: 'web',
//     text:
//       'Integer ultrices volutpat eros nec pellentesque. Sed vel ante ac orci porta egestas. Integer suscipit pellentesque orci, accumsan auctor leo egestas eget. Fusce tincidunt sollicitudin hendrerit. Quisque volutpat ante tellus, vel rhoncus lectus bibendum ut. Pellentesque a tortor ac mi cursus dapibus aliquet suscipit odio.',
//   },
//   {
//     date: '2020-03-03 13:27:31',
//     type: 'sms',
//     text:
//       'Integer ultrices volutpat eros nec pellentesque. Sed vel ante ac orci porta egestas. Integer suscipit pellentesque orci, accumsan auctor leo egestas eget. Fusce tincidunt sollicitudin hendrerit. Quisque volutpat ante tellus, vel rhoncus lectus bibendum ut. Pellentesque a tortor ac mi cursus dapibus aliquet suscipit odio.',
//   },
// ];

const Timeline = ({ task, form, caseId, onClickAddNote }) => {
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
                <ViewButton>View</ViewButton>
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
