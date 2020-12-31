/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import type { CaseInfo, IncidentEntry } from '../../types/types';
import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText } from '../../styles/case';
import CaseAddButton from './CaseAddButton';
import TimelineInformationRow from './TimelineInformationRow';
import IncidentForm from '../../formDefinitions/caseForms/IncidentForm.json';

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
            values={[
              // this can later come from a layout definition property, where we specify what items to display for each row, depending if it's incident, hh, or peretrator
              { label: IncidentForm.find(e => e.name === 'date').label, value: i.incident.date },
              { label: IncidentForm.find(e => e.name === 'duration').label, value: i.incident.duration },
              { label: IncidentForm.find(e => e.name === 'location').label, value: i.incident.location },
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
