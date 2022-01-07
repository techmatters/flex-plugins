/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import type { DefinitionVersion } from 'hrm-form-definitions';

import type { CaseInfo, IncidentEntry } from '../../types/types';
import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText } from '../../styles/case';
import CaseAddButton from './CaseAddButton';
import TimelineInformationRow from './TimelineInformationRow';
import { PermissionActions, PermissionActionType } from '../../permissions';

type OwnProps = {
  onClickAddIncident: () => void;
  onClickView: (incident: IncidentEntry) => void;
  incidents: CaseInfo['incidents'];
  can: (action: PermissionActionType) => boolean;
  definitionVersion: DefinitionVersion;
};

const Incidents: React.FC<OwnProps> = ({ onClickAddIncident, onClickView, incidents, can, definitionVersion }) => {
  return (
    <>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id="Case-AddIncidentSection-label">
            <Template code="Case-AddIncidentSection" />
          </CaseSectionFont>
          <CaseAddButton
            templateCode="Case-Incident"
            onClick={onClickAddIncident}
            disabled={!can(PermissionActions.ADD_INCIDENT)}
          />
        </Row>
      </Box>
      {incidents.length ? (
        incidents.map((i, index) => (
          <TimelineInformationRow
            key={`incident-${index}`}
            onClickView={() => onClickView(i)}
            definition={definitionVersion.caseForms.IncidentForm}
            values={i.incident}
            layoutDefinition={definitionVersion.layoutVersion.case.incidents}
          />
        ))
      ) : (
        <TimelineRow>
          <PlaceHolderText>
            <Template code="Case-NoIncidents" />
          </PlaceHolderText>
        </TimelineRow>
      )}
    </>
  );
};

Incidents.displayName = 'Incidents';

export default Incidents;
