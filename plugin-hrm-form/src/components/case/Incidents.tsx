/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import type { CaseInfo, IncidentEntry, CaseStatus } from '../../types/types';
import { Box, Row } from '../../styles/HrmStyles';
import { CaseSectionFont, TimelineRow, PlaceHolderText } from '../../styles/case';
import CaseAddButton from './CaseAddButton';
import TimelineInformationRow from './TimelineInformationRow';
import type { FormsVersion } from '../common/forms/types';

type OwnProps = {
  onClickAddIncident: () => void;
  onClickView: (incident: IncidentEntry) => void;
  incidents: CaseInfo['incidents'];
  status: CaseStatus;
  formsVersion: FormsVersion;
};

const Incidents: React.FC<OwnProps> = ({ onClickAddIncident, onClickView, incidents, status, formsVersion }) => {
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
          <TimelineInformationRow
            key={`incident-${index}`}
            onClickView={() => onClickView(i)}
            definition={formsVersion.caseForms.IncidentForm}
            values={i.incident}
            layoutDefinition={formsVersion.layoutVersion.case.incidents}
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
