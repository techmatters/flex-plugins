import React from 'react';
import PropTypes from 'prop-types';
import { Template, withTaskContext } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import { namespace, contactFormsBase, configurationBase } from '../../states';
import { taskType, formType } from '../../types';
import { getConfig } from '../../HrmFormPlugin';
import { saveToHrm, connectToCase } from '../../services/ContactService';
import { Box } from '../../styles/HrmStyles';
import { CaseContainer, CaseNumberFont, CaseSectionFont } from '../../styles/case';
import CaseDetails from './CaseDetails';
import { formatName } from '../../utils';

const Case = props => {
  const { connectedCase } = props.form.metadata;

  if (!connectedCase) return null;

  const { firstName, lastName } = props.form.childInformation.name;
  const name = formatName(`${firstName.value} ${lastName.value}`);
  const { createdAt, twilioWorkerId, status } = connectedCase;
  const counselor = props.counselorsHash[twilioWorkerId];
  const date = new Date(createdAt).toLocaleDateString();

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
          <CaseSectionFont id="Case-CaseDetailsSection-label">
            <Template code="Case-CaseDetailsSection" />
          </CaseSectionFont>
          <CaseDetails name={name} status={status} counselor={counselor} date={date} />
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
  counselorsHash: PropTypes.shape({}).isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  form: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid],
  counselorsHash: state[namespace][configurationBase].counselors.hash,
});

export default withTaskContext(connect(mapStateToProps)(Case));
