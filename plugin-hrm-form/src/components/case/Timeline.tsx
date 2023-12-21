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
import { parseISO } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import CallTypeIcon from '../common/icons/CallTypeIcon';
import TimelineIcon from './TimelineIcon';
import {
  CaseDetailsBorder,
  CaseSectionFont,
  TimelineCallTypeIcon,
  TimelineDate,
  TimelineRow,
  TimelineText,
  ViewButton,
} from './styles';
import { Box, Row } from '../../styles/HrmStyles';
import CaseAddButton from './CaseAddButton';
import { CustomITask } from '../../types/types';
import { isConnectedCaseActivity } from '../../states/case/caseActivities';
import { ConnectedCaseActivity, NoteActivity, ReferralActivity } from '../../states/case/types';
import { getPermissionsForContact, PermissionActions, PermissionActionType } from '../../permissions';
import { CaseItemAction, CaseSectionSubroute, NewCaseSubroutes } from '../../states/routing/types';
import { newOpenModalAction } from '../../states/routing/actions';
import { RootState } from '../../states';
import { selectCaseActivities } from '../../states/case/timeline';
import selectCurrentRouteCaseState from '../../states/case/selectCurrentRouteCase';

type OwnProps = {
  can: (action: PermissionActionType) => boolean;
  taskSid: CustomITask['taskSid'];
};

const mapStateToProps = (state: RootState, { taskSid }: OwnProps) => {
  const { connectedCase } = selectCurrentRouteCaseState(state, taskSid) ?? {};

  return {
    timelineActivities: connectedCase ? selectCaseActivities(state, connectedCase.id) : [],
    connectedCase,
  };
};

const mapDispatchToProps = (dispatch, { taskSid }: OwnProps) => ({
  openContactModal: (contactId: string) =>
    dispatch(newOpenModalAction({ route: 'contact', subroute: 'view', id: contactId }, taskSid)),
  openAddCaseSectionModal: (caseId: string, subroute: CaseSectionSubroute) =>
    dispatch(newOpenModalAction({ route: 'case', subroute, action: CaseItemAction.Add, caseId }, taskSid)),
  openViewCaseSectionModal: (caseId: string, subroute: CaseSectionSubroute, id: string) =>
    dispatch(newOpenModalAction({ route: 'case', subroute, id, action: CaseItemAction.View, caseId }, taskSid)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const Timeline: React.FC<Props> = ({
  can,
  timelineActivities,
  openContactModal,
  openViewCaseSectionModal,
  openAddCaseSectionModal,
  connectedCase,
}) => {
  const [mockedMessage, setMockedMessage] = useState(null);

  if (!connectedCase || !timelineActivities) {
    return null;
  }
  const caseId = connectedCase.id;
  const handleViewNoteClick = ({ id }: NoteActivity) => {
    openViewCaseSectionModal(caseId, NewCaseSubroutes.Note, id);
  };

  const handleViewReferralClick = ({ id }: ReferralActivity) => {
    openViewCaseSectionModal(caseId, NewCaseSubroutes.Referral, id);
  };

  const handleViewConnectedCaseActivityClick = ({ contactId }: ConnectedCaseActivity) => {
    openContactModal(contactId);
  };

  const handleAddNoteClick = () => {
    openAddCaseSectionModal(caseId, NewCaseSubroutes.Note);
  };

  const handleAddReferralClick = () => {
    openAddCaseSectionModal(caseId, NewCaseSubroutes.Referral);
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
              if (activity.showViewButton) {
                const { can } = getPermissionsForContact(activity.twilioWorkerId);
                canViewActivity = can(PermissionActions.VIEW_CONTACT);
              } else {
                canViewActivity = false;
              }
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

const connected = connector(Timeline);

export default connected;
