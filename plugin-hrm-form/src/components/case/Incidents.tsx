/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import type { CaseInfo, IncidentEntry, CaseStatus } from '../../types/types';
import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText } from '../../styles/case';
import CaseAddButton from './CaseAddButton';
import TimelineInformationRow from './TimelineInformationRow';
import IncidentForm from '../../formDefinitions/caseForms/IncidentForm.json';
import layoutDefinitions from '../../formDefinitions/layoutDefinitions.json';
import type { FormDefinition, LayoutDefinition } from '../common/forms/types';

type OwnProps = {
  onClickAddIncident: () => void;
  onClickView: (incident: IncidentEntry) => void;
  incidents: CaseInfo['incidents'];
  status: CaseStatus;
};

const Incidents: React.FC<OwnProps> = ({ onClickAddIncident, onClickView, incidents, status }) => {
  return (
    <>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id="Case-AddIncidentSection-label">
            <Template code="Case-AddIncidentSection" />
          </CaseSectionFont>
          <CaseAddButton templateCode="Case-Incident" onClick={onClickAddIncident} status={status} />
        </Row>
      </Box>
      {incidents.length ? (
        incidents.map((i, index) => (
          // <InformationRow key={`perpetrator-${index}`} person={p.incident} onClickView={() => onClickView(p)} />
          <TimelineInformationRow
            key={`incident-${index}`}
            onClickView={() => onClickView(i)}
            definition={IncidentForm as FormDefinition}
            values={i.incident}
            layoutDefinition={layoutDefinitions.incidents as LayoutDefinition}
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
