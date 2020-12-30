/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import type { CaseInfo, IncidentEntry } from '../../types/types';
import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText } from '../../styles/case';
import CaseAddButton from './CaseAddButton';
import InformationRow from './InformationRow';

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
          <div key={`incident-${index}`}>{Object.entries(i.incident)} </div>
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
