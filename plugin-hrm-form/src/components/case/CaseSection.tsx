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

import React, { useEffect } from 'react';
import { Template } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Row } from '../../styles';
import { CaseDetailsBorder, CaseSectionFont, PlaceHolderText, TimelineRow } from './styles';
import CaseAddButton from './CaseAddButton';
import { RootState } from '../../states';
import { newGetTimelineAsyncAction, selectTimeline } from '../../states/case/timeline';
import { TimelineActivity } from '../../states/case/types';
import { FullCaseSection } from '../../services/caseSectionService';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { CaseItemAction, isCaseRoute } from '../../states/routing/types';
import { newOpenModalAction } from '../../states/routing/actions';
import asyncDispatch from '../../states/asyncDispatch';
import selectCurrentRouteCase from '../../states/case/selectCurrentRouteCase';
import CaseSectionListRow from './CaseSectionListRow';
import { selectDefinitionVersionForCase } from '../../states/configuration/selectDefinitions';

type Props = {
  canAdd: () => boolean;
  taskSid: string;
  sectionType: string;
};

const MAX_SECTIONS = 100;

const CaseSection: React.FC<Props> = ({ taskSid, canAdd, sectionType }) => {
  const route = useSelector((state: RootState) => selectCurrentTopmostRouteForTask(state, taskSid));
  const caseId = isCaseRoute(route) ? route.caseId : undefined;
  const { sections } = useSelector(
    (state: RootState) => selectCurrentRouteCase(state, taskSid) ?? { sections: undefined },
  );
  const sectionIdCsv = Object.keys(sections?.[sectionType] ?? {}).join(','); // Used to trigger re-fetch of sections
  const sectionsTimeline: TimelineActivity<FullCaseSection>[] = useSelector((state: RootState) =>
    selectTimeline(state, caseId, sectionType, {
      offset: 0,
      limit: MAX_SECTIONS,
    }),
  ) as TimelineActivity<FullCaseSection>[];
  const definitionVersion = useSelector((state: RootState) =>
    selectDefinitionVersionForCase(state, selectCurrentRouteCase(state, taskSid).connectedCase),
  );
  const dispatch = useDispatch();
  const asyncDispatcher = asyncDispatch(dispatch);

  useEffect(() => {
    if (caseId) {
      // eslint-disable-next-line no-console
      console.log(`Fetching ${sectionType} sections for case ${caseId}`);
      asyncDispatcher(
        newGetTimelineAsyncAction(
          caseId,
          sectionType,
          [sectionType],
          false,
          { offset: 0, limit: MAX_SECTIONS },
          `case-${caseId}`,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, sectionIdCsv, sectionType]);

  const { caseSectionTypes } = definitionVersion;
  const caseLayouts = definitionVersion.layoutVersion.case.sectionTypes;
  return (
    <CaseDetailsBorder sectionTypeId={sectionType === 'document'}>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id={`Case-AddSection-label-${sectionType}`}>
            <Template code={`Case-SectionList-Title/${sectionType}`} />
          </CaseSectionFont>
          <CaseAddButton
            templateCode={`Case-SectionList-Add/${sectionType}`}
            onClick={() =>
              dispatch(
                newOpenModalAction(
                  { route: 'case', subroute: `section/${sectionType}`, action: CaseItemAction.Add, caseId },
                  taskSid,
                ),
              )
            }
            disabled={!canAdd()}
          />
        </Row>
      </Box>
      {sectionsTimeline && sectionsTimeline.length ? (
        sectionsTimeline.map(({ activity }) => (
          <CaseSectionListRow
            key={`${sectionType}-${activity.sectionId}`}
            onClickView={() =>
              dispatch(
                newOpenModalAction(
                  {
                    route: 'case',
                    subroute: `section/${sectionType}`,
                    action: CaseItemAction.View,
                    id: activity.sectionId,
                    caseId,
                  },
                  taskSid,
                ),
              )
            }
            definition={caseSectionTypes[sectionType].form}
            section={activity}
            layoutDefinition={caseLayouts[sectionType] || {}}
          />
        ))
      ) : (
        <TimelineRow>
          <PlaceHolderText>
            <Template code={`Case-SectionList-NoItems/${sectionType}`} />
          </PlaceHolderText>
        </TimelineRow>
      )}
    </CaseDetailsBorder>
  );
};

CaseSection.displayName = `CaseSection`;

export default CaseSection;
