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
import React, { useEffect, useMemo, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import CallTypeIcon from '../../common/icons/CallTypeIcon';
import TimelineIcon, { IconType } from './TimelineIcon';
import { CaseSectionFont, TimelineCallTypeIcon, TimelineDate, TimelineRow, TimelineText, ViewButton } from '../styles';
import { Box, Row, colors } from '../../../styles';
import CaseAddButton from '../CaseAddButton';
import { Case, Contact, CustomITask } from '../../../types/types';
import { isCaseSectionTimelineActivity, isContactTimelineActivity } from '../../../states/case/types';
import { getInitializedCan, PermissionActions } from '../../../permissions';
import { CaseItemAction, CaseSectionSubroute, isCaseRoute, NewCaseSubroutes } from '../../../states/routing/types';
import { newOpenModalAction } from '../../../states/routing/actions';
import { RootState } from '../../../states';
import { newGetTimelineAsyncAction, selectTimeline, UITimelineActivity } from '../../../states/case/timeline';
import selectCurrentRouteCaseState from '../../../states/case/selectCurrentRouteCase';
import InfoIcon from '../../caseMergingBanners/InfoIcon';
import { selectCurrentTopmostRouteForTask } from '../../../states/routing/getRoute';
import asyncDispatch from '../../../states/asyncDispatch';
import { selectContactsByCaseIdInCreatedOrder } from '../../../states/contacts/selectContactByCaseId';
import { FullCaseSection } from '../../../services/caseSectionService';

type OwnProps = {
  taskSid: CustomITask['taskSid'];
  timelineId: string;
  pageSize: number;
  page: number;
  titleCode?: string;
};

const mapStateToProps = (state: RootState, { taskSid, timelineId, pageSize, page }: OwnProps) => {
  const route = selectCurrentTopmostRouteForTask(state, taskSid);
  if (isCaseRoute(route)) {
    const { connectedCase, sections } = selectCurrentRouteCaseState(state, taskSid);
    return {
      timelineActivities: selectTimeline(state, route.caseId, timelineId, { offset: page * pageSize, limit: pageSize }),
      connectedCase,
      contactIds: selectContactsByCaseIdInCreatedOrder(state, route.caseId)
        .map(contact => contact.savedContact.id)
        .join(),
      noteIds: Object.keys(sections?.note ?? {}).join(),
      referralIds: Object.keys(sections?.note ?? {}).join(),
    };
  }
  return {};
};

const mapDispatchToProps = (dispatch, { taskSid, timelineId, page, pageSize }: OwnProps) => ({
  openContactModal: (contactId: string) =>
    dispatch(newOpenModalAction({ route: 'contact', subroute: 'view', id: contactId }, taskSid)),
  openAddCaseSectionModal: (caseId: string, subroute: CaseSectionSubroute) =>
    dispatch(newOpenModalAction({ route: 'case', subroute, action: CaseItemAction.Add, caseId }, taskSid)),
  openViewCaseSectionModal: (caseId: string, subroute: CaseSectionSubroute, id: string) =>
    dispatch(newOpenModalAction({ route: 'case', subroute, id, action: CaseItemAction.View, caseId }, taskSid)),
  getTimeline: (caseId: Case['id']) =>
    asyncDispatch(dispatch)(
      newGetTimelineAsyncAction(caseId, timelineId, ['note', 'referral'], true, {
        offset: page * pageSize,
        limit: pageSize,
      }),
    ),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const Timeline: React.FC<Props> = ({
  timelineActivities,
  openContactModal,
  openViewCaseSectionModal,
  openAddCaseSectionModal,
  connectedCase,
  titleCode = 'Case-Timeline-RecentTitle',
  getTimeline,
  contactIds,
  noteIds,
  referralIds,
}) => {
  const [mockedMessage, setMockedMessage] = useState(null);

  const can = useMemo(() => {
    return getInitializedCan();
  }, []);

  const caseId = connectedCase.id;

  useEffect(() => {
    if (caseId) {
      // eslint-disable-next-line no-console
      console.log(`Fetching main timeline sections for case ${caseId}`);
      getTimeline(caseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, noteIds, referralIds, contactIds]);

  if (!connectedCase || !timelineActivities) {
    return null;
  }

  const handleViewSectionClick = ({ sectionId, sectionType }: FullCaseSection) => {
    openViewCaseSectionModal(caseId, sectionType, sectionId);
  };

  const handleViewConnectedCaseActivityClick = ({ id }: Contact) => {
    openContactModal(id);
  };

  const handleAddNoteClick = () => {
    openAddCaseSectionModal(caseId, NewCaseSubroutes.Note);
  };

  const handleAddReferralClick = () => {
    openAddCaseSectionModal(caseId, NewCaseSubroutes.Referral);
  };

  const handleViewClick = (timelineActivity: UITimelineActivity) => {
    if (isCaseSectionTimelineActivity(timelineActivity)) {
      handleViewSectionClick(timelineActivity.activity);
    } else if (isContactTimelineActivity(timelineActivity)) {
      handleViewConnectedCaseActivityClick(timelineActivity.activity);
    } else {
      setMockedMessage(<Template code="NotImplemented" />);
    }
  };

  return (
    <Box marginTop="25px">
      <Dialog onClose={() => setMockedMessage(null)} open={Boolean(mockedMessage)}>
        <DialogContent>{mockedMessage}</DialogContent>
      </Dialog>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id="Case-TimelineSection-label">
            <Template code={titleCode} />
          </CaseSectionFont>
          <Box marginLeft="auto">
            <CaseAddButton
              templateCode="Case-Note"
              onClick={handleAddNoteClick}
              disabled={!can(PermissionActions.ADD_CASE_SECTION, connectedCase)}
            />
            <CaseAddButton
              templateCode="Case-Referral"
              onClick={handleAddReferralClick}
              disabled={!can(PermissionActions.ADD_CASE_SECTION, connectedCase)}
              withDivider
            />
          </Box>
        </Row>
      </Box>
      {timelineActivities &&
        timelineActivities.length > 0 &&
        timelineActivities.map((timelineActivity, index) => {
          let iconType: IconType;
          if (isContactTimelineActivity(timelineActivity)) {
            iconType = timelineActivity.activity.channel as IconType;
          } else if (isCaseSectionTimelineActivity(timelineActivity)) {
            iconType = timelineActivity.activity.sectionType as IconType;
          }
          const date = timelineActivity.timestamp.toLocaleDateString(navigator.language);
          let canViewActivity = true;
          if (isContactTimelineActivity(timelineActivity)) {
            if (timelineActivity.isDraft) {
              canViewActivity = false;
            } else {
              canViewActivity = can(PermissionActions.VIEW_CONTACT, timelineActivity);
            }
          }

          return (
            <TimelineRow
              key={index}
              style={{
                backgroundColor: timelineActivity.isDraft ? colors.background.yellow : undefined,
              }}
            >
              <TimelineDate>{date}</TimelineDate>
              <TimelineIcon type={iconType} />
              {isContactTimelineActivity(timelineActivity) && (
                <TimelineCallTypeIcon>
                  <CallTypeIcon callType={timelineActivity.activity.rawJson.callType} fontSize="18px" />
                </TimelineCallTypeIcon>
              )}
              <TimelineText>{timelineActivity.text}</TimelineText>
              {canViewActivity && (
                <Box marginLeft="auto">
                  <Box marginLeft="auto">
                    <ViewButton onClick={() => handleViewClick(timelineActivity)}>
                      <Template code="Case-ViewButton" />
                    </ViewButton>
                  </Box>
                </Box>
              )}
              {timelineActivity.isDraft && (
                <Box marginLeft="auto">
                  <Box marginLeft="auto">
                    <InfoIcon color="#fed44b" />
                  </Box>
                </Box>
              )}
            </TimelineRow>
          );
        })}
    </Box>
  );
};
Timeline.displayName = 'Timeline';

const connected = connector(Timeline);

export default connected;
