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

import React, { Dispatch, useEffect } from 'react';
import { Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { Box, Row } from '../../styles';
import { CaseDetailsBorder, CaseSectionFont, PlaceHolderText, TimelineRow } from './styles';
import CaseAddButton from './CaseAddButton';
import { Case, WellKnownCaseSection } from '../../types/types';
import { RootState } from '../../states';
import { newGetTimelineAsyncAction, selectTimeline } from '../../states/case/timeline';
import { TimelineActivity } from '../../states/case/types';
import { FullCaseSection } from '../../services/caseSectionService';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { CaseItemAction, isCaseRoute } from '../../states/routing/types';
import InformationRow from './InformationRow';
import { newOpenModalAction } from '../../states/routing/actions';
import asyncDispatch from '../../states/asyncDispatch';

type OwnProps = {
  canAdd: () => boolean;
  taskSid: string;
  sectionType: WellKnownCaseSection;
  sectionRenderer?: (section: FullCaseSection, onView: () => void) => JSX.Element | null;
};

const MAX_SECTIONS = 100;

const mapStateToProps = (state: RootState, { sectionType, taskSid }: OwnProps) => {
  const route = selectCurrentTopmostRouteForTask(state, taskSid);
  if (isCaseRoute(route)) {
    return {
      sectionsTimeline: selectTimeline(state, route.caseId, sectionType, {
        offset: 0,
        limit: MAX_SECTIONS,
      }) as TimelineActivity<FullCaseSection>[],
      caseId: route.caseId,
    };
  }
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { taskSid, sectionType }: OwnProps) => {
  return {
    viewCaseSection: (caseId: Case['id'], sectionId: string) =>
      newOpenModalAction(
        { route: 'case', subroute: sectionType, action: CaseItemAction.View, id: sectionId, caseId },
        taskSid,
      ),
    addCaseSection: (caseId: Case['id']) =>
      newOpenModalAction({ route: 'case', subroute: sectionType, action: CaseItemAction.Add, caseId }, taskSid),
    getTimeline: (caseId: Case['id']) =>
      asyncDispatch(dispatch)(
        newGetTimelineAsyncAction(caseId, sectionType, [sectionType], false, { offset: 0, limit: MAX_SECTIONS }),
      ),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector> & OwnProps;

const CaseSection: React.FC<Props> = ({
  canAdd,
  sectionType,
  sectionRenderer = ({ sectionTypeSpecificData, sectionId, sectionType }, viewHandler) => (
    <InformationRow key={`${sectionType}-${sectionId}`} person={sectionTypeSpecificData} onClickView={viewHandler} />
  ),
  caseId,
  sectionsTimeline,
  viewCaseSection,
  addCaseSection,
  getTimeline,
}) => {
  const timelineLoaded = Boolean(sectionsTimeline);
  useEffect(() => {
    if (caseId && !timelineLoaded) {
      // eslint-disable-next-line no-console
      console.log(`Fetching ${sectionType} sections for case ${caseId}`);
      getTimeline(caseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, timelineLoaded, sectionType]);

  const capitializedSectionType = sectionType.charAt(0).toUpperCase() + sectionType.slice(1);
  return (
    <CaseDetailsBorder sectionTypeId={sectionType === 'document'}>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id={`Case-Add${capitializedSectionType}Section-label`}>
            <Template code={`Case-Add${capitializedSectionType}Section`} />
          </CaseSectionFont>
          <CaseAddButton
            templateCode={`Case-${capitializedSectionType}`}
            onClick={() => addCaseSection(caseId)}
            disabled={!canAdd()}
          />
        </Row>
      </Box>
      {sectionsTimeline && sectionsTimeline.length ? (
        sectionsTimeline.map(({ activity }) =>
          sectionRenderer(activity, () => viewCaseSection(caseId, activity.sectionId)),
        )
      ) : (
        <TimelineRow>
          <PlaceHolderText>
            <Template code={`Case-No${capitializedSectionType}s`} />
          </PlaceHolderText>
        </TimelineRow>
      )}
    </CaseDetailsBorder>
  );
};

CaseSection.displayName = `CaseSection`;

export default connector(CaseSection);
