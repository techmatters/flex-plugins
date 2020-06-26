import React from 'react';
import PropTypes from 'prop-types';
import { Template, withTaskContext } from '@twilio/flex-ui';

import { taskType, formType } from '../../types';
import { getConfig } from '../../HrmFormPlugin';
import { saveToHrm, connectToCase } from '../../services/ContactService';
import { Box } from '../../styles/HrmStyles';
import { CaseContainer, CaseNumberFont, CaseSectionFont } from '../../styles/case';
import CaseDetails from './CaseDetails';

const Case = props => {
  const { connectedCase } = props.form.metadata;
  if (!connectedCase) return null;

  const saveAndEnd = async () => {
    const { task, form } = props;
    const { hrmBaseUrl, workerSid, helpline, strings } = getConfig();

    try {
      const contact = await saveToHrm(task, form, hrmBaseUrl, workerSid, helpline);
      await connectToCase(hrmBaseUrl, contact.id, connectedCase.id);
      props.handleCompleteTask(task.taskSid, task);
    } catch (error) {
      window.alert(strings['Error-Backend']);
    }
  };

  return (
    <CaseContainer>
      <Box paddingRight="45px">
        <Box marginLeft="25px" marginTop="22px">
          <CaseNumberFont>
            <Template code="Case-CaseNumber" /> #{connectedCase.id}
          </CaseNumberFont>
        </Box>
        <Box marginLeft="40px" marginTop="13px">
          <CaseSectionFont>
            <Template code="Case-CaseDetailsSection" />
          </CaseSectionFont>
          <CaseDetails />
        </Box>
      </Box>
      <button type="button" onClick={saveAndEnd} style={{ marginTop: 'auto', alignSelf: 'flex-end' }}>
        <Template code="BottomBar-SaveAndAddToCase" />
      </button>
    </CaseContainer>
  );
};

Case.displayName = 'Case';
Case.propTypes = {
  handleCompleteTask: PropTypes.func.isRequired,
  task: taskType.isRequired,
  form: formType.isRequired,
};

export default withTaskContext(Case);
