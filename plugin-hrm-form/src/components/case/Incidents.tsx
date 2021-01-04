/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import type { CaseInfo, IncidentEntry } from '../../types/types';
import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText } from '../../styles/case';
import CaseAddButton from './CaseAddButton';
import TimelineInformationRow from './TimelineInformationRow';
import IncidentForm from '../../formDefinitions/caseForms/IncidentForm.json';
import type { FormDefinition } from '../common/forms/types';

type OwnProps = {
  onClickAddIncident: () => void;
  onClickView: (incident: IncidentEntry) => void;
  incidents: CaseInfo['incidents'];
};

const Incidents: React.FC<OwnProps> = ({ onClickAddIncident, onClickView, incidents }) => {
  return (
    <>
      <Box marginBottom="10px">
        <Row>
          <CaseSectionFont id="Case-AddIncidentSection-label">
            <Template code="Case-AddIncidentSection" />
          </CaseSectionFont>
          <CaseAddButton templateCode="Case-Incident" onClick={onClickAddIncident} />
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
            displayValues={[
              // this can be moved to a layout configuration
              {
                name: 'date',
                includeLabel: false,
                format: 'date',
              },
              {
                name: 'duration',
                includeLabel: true,
              },
              {
                name: 'location',
                includeLabel: true,
              },
            ]}
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
