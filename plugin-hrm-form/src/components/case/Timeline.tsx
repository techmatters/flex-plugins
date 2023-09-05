/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

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
import * as RoutingActions from '../../states/routing/actions';
import { CustomITask, HrmServiceContact } from '../../types/types';
import { isConnectedCaseActivity } from './caseActivities';
import { Activity, ConnectedCaseActivity, NoteActivity, ReferralActivity } from '../../states/case/types';
import { getPermissionsForContact, PermissionActions, PermissionActionType } from '../../permissions';
import { NewCaseSubroutes, AppRoutesWithCase, CaseItemAction } from '../../states/routing/types';
import { TaskEntry } from '../../states/contacts/types';

type OwnProps = {
  timelineActivities: Activity[];
  can: (action: PermissionActionType) => boolean;
  taskSid: CustomITask['taskSid'];
  route: AppRoutesWithCase['route'];
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const Timeline: React.FC<Props> = props => {
  const { can, taskSid, changeRoute, route, timelineActivities } = props;
  const [mockedMessage, setMockedMessage] = useState(null);

  const handleViewNoteClick = (activity: NoteActivity) => {
    changeRoute({ route, subroute: NewCaseSubroutes.Note, action: CaseItemAction.View, id: activity.id }, taskSid);
  };

  const handleViewReferralClick = (activity: ReferralActivity) => {
    changeRoute({ route, subroute: NewCaseSubroutes.Referral, action: CaseItemAction.View, id: activity.id }, taskSid);
  };

  const handleViewConnectedCaseActivityClick = (activity: ConnectedCaseActivity) => {
    changeRoute({ route, subroute: NewCaseSubroutes.ViewContact, id: activity.contactId }, taskSid);
  };

  const handleAddNoteClick = () => {
    changeRoute({ route, subroute: NewCaseSubroutes.Note, action: CaseItemAction.Add }, taskSid);
  };

  const handleAddReferralClick = () => {
    changeRoute({ route, subroute: NewCaseSubroutes.Referral, action: CaseItemAction.Add }, taskSid);
  };

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
            let canViewActivity = true;
            if (isConnectedCaseActivity(activity)) {
              const { can } = getPermissionsForContact(activity.twilioWorkerId);
              canViewActivity = can(PermissionActions.VIEW_CONTACT);
            }

            return (
              <TimelineRow key={index}>
                <TimelineDate>{date}</TimelineDate>
                <TimelineIcon type={isConnectedCaseActivity(activity) ? activity.channel : activity.type} />
                {isConnectedCaseActivity(activity) && (
                  <TimelineCallTypeIcon>
                    <CallTypeIcon callType={activity.callType} fontSize="18px" />
                  </TimelineCallTypeIcon>
                )}
                <TimelineText>{activity?.text}</TimelineText>
                {canViewActivity && (
                  <Box marginLeft="auto">
                    <Box marginLeft="auto">
                      <ViewButton onClick={() => handleViewClick(activity)}>
                        <Template code="Case-ViewButton" />
                      </ViewButton>
                    </Box>
                  </Box>
                )}
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
});

const connector = connect(null, mapDispatchToProps);
const connected = connector(Timeline);

export default connected;
