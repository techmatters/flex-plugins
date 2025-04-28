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

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import CallTypeIcon from '../../common/icons/CallTypeIcon';
import TimelineIcon, { IconType } from './TimelineIcon';
import { CaseSectionFont, TimelineCallTypeIcon, TimelineDate, TimelineRow, TimelineText, ViewButton } from '../styles';
import { Box, Row, colors } from '../../../styles';
import CaseAddButton from '../CaseAddButton';
import { Contact, CustomITask } from '../../../types/types';
import { isCaseSectionTimelineActivity, isContactTimelineActivity } from '../../../states/case/types';
import { getInitializedCan, PermissionActions } from '../../../permissions';
import { CaseItemAction, isCaseRoute } from '../../../states/routing/types';
import { newOpenModalAction } from '../../../states/routing/actions';
import { RootState } from '../../../states';
import { newGetTimelineAsyncAction, selectTimeline, UITimelineActivity } from '../../../states/case/timeline';
import selectCurrentRouteCaseState from '../../../states/case/selectCurrentRouteCase';
import InfoIcon from '../../caseMergingBanners/InfoIcon';
import { selectCurrentTopmostRouteForTask } from '../../../states/routing/getRoute';
import asyncDispatch from '../../../states/asyncDispatch';
import { selectContactsByCaseIdInCreatedOrder } from '../../../states/contacts/selectContactByCaseId';
import { FullCaseSection } from '../../../services/caseSectionService';
import { selectDefinitionVersionForCase } from '../../../states/configuration/selectDefinitions';
import formatFormValue from '../../forms/formatFormValue';

type OwnProps = {
  taskSid: CustomITask['taskSid'];
  timelineId: string;
  pageSize: number;
  page: number;
  titleCode?: string;
};
const Timeline: React.FC<OwnProps> = ({
  taskSid,
  page,
  pageSize,
  timelineId,
  titleCode = 'Case-Timeline-RecentTitle',
}) => {
  // Hooks
  const route = useSelector((state: RootState) => selectCurrentTopmostRouteForTask(state, taskSid));
  const { connectedCase, sections } = useSelector((state: RootState) => selectCurrentRouteCaseState(state, taskSid));

  const timelineActivities = useSelector((state: RootState) =>
    isCaseRoute(route)
      ? selectTimeline(state, route.caseId, timelineId, { offset: page * pageSize, limit: pageSize })
      : [],
  );
  const contacts = useSelector((state: RootState) =>
    isCaseRoute(route) ? selectContactsByCaseIdInCreatedOrder(state, route.caseId) : [],
  );

  const dispatch = useDispatch();
  const contactIds = contacts.map(contact => contact.savedContact.id).join();
  const definitionVersion = useSelector((state: RootState) => selectDefinitionVersionForCase(state, connectedCase));
  const [mockedMessage, setMockedMessage] = useState(null);

  const can = useMemo(() => {
    return getInitializedCan();
  }, []);

  const scopedSectionIds = Object.entries(sections ?? {})
    .flatMap(([sectionType, sectionEntries]) =>
      Object.keys(sectionEntries).map(sectionEntry => `${sectionType}/${sectionEntry}`),
    )
    .join();

  const timelineCaseSectionTypes = Object.entries(definitionVersion.layoutVersion.case.sectionTypes)
    .filter(([, { caseHomeLocation }]) => caseHomeLocation === 'timeline')
    .map(([sectionTypeName]) => sectionTypeName);

  const caseId = connectedCase.id;
  useEffect(() => {
    if (caseId) {
      console.log(`Fetching main timeline sections for case ${caseId}`);
      asyncDispatch(dispatch)(
        newGetTimelineAsyncAction(caseId, timelineId, timelineCaseSectionTypes, true, {
          offset: page * pageSize,
          limit: pageSize,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, scopedSectionIds, contactIds]);
  // /Hooks

  if (!connectedCase || !timelineActivities) {
    return null;
  }

  const handleViewSectionClick = ({ sectionId, sectionType }: FullCaseSection) => {
    dispatch(
      newOpenModalAction(
        { route: 'case', subroute: `section/${sectionType}`, id: sectionId, action: CaseItemAction.View, caseId },
        taskSid,
      ),
    );
  };

  const handleViewConnectedCaseActivityClick = ({ id }: Contact) => {
    dispatch(newOpenModalAction({ route: 'contact', subroute: 'view', id }, taskSid));
  };

  const handleAddCaseSectionClick = (caseSectionType: string) => {
    dispatch(
      newOpenModalAction(
        { route: 'case', subroute: `section/${caseSectionType}`, action: CaseItemAction.Add, caseId },
        taskSid,
      ),
    );
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
            {timelineCaseSectionTypes.map(sectionType => (
              <CaseAddButton
                key={sectionType}
                templateCode={`Case-SectionList-Add/${sectionType}`}
                onClick={() => handleAddCaseSectionClick(sectionType)}
                disabled={!can(PermissionActions.ADD_CASE_SECTION, connectedCase)}
              />
            ))}
          </Box>
        </Row>
      </Box>
      {timelineActivities &&
        timelineActivities.length > 0 &&
        timelineActivities.map((timelineActivity, index) => {
          let iconType: IconType;
          let { text } = timelineActivity;
          if (isContactTimelineActivity(timelineActivity)) {
            iconType = timelineActivity.activity.channel as IconType;
          } else if (isCaseSectionTimelineActivity(timelineActivity)) {
            const layout = definitionVersion.layoutVersion.case.sectionTypes[timelineActivity.activity.sectionType];
            iconType = (layout?.timelineIcon || timelineActivity.activity.sectionType) as IconType;

            text =
              (layout.previewFields ?? [])
                .map(field =>
                  formatFormValue(
                    timelineActivity.activity.sectionTypeSpecificData[field],
                    layout?.layout?.[field],
                    timelineActivity.activity.sectionTypeSpecificData,
                  ),
                )
                .join(', ') || '--';
          }
          const date = timelineActivity.timestamp.toLocaleDateString(navigator.language);
          let canViewActivity = true;
          if (isContactTimelineActivity(timelineActivity)) {
            if (timelineActivity.isDraft) {
              canViewActivity = false;
            } else {
              const contactId = timelineActivity.activity.id;
              const { savedContact } = contacts.find(contact => contact.savedContact?.id === contactId);
              canViewActivity = savedContact ? can(PermissionActions.VIEW_CONTACT, savedContact) : can(PermissionActions.VIEW_CONTACT, timelineActivity);
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
              <TimelineText>{text}</TimelineText>
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

export default Timeline;
