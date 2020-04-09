import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from '@material-ui/core';

import { caseInformationType } from '../../types';
import FieldText from '../FieldText';
import FieldSelect from '../FieldSelect';
import { ColumnarBlock, Container, TwoColumnLayout, CheckboxField, StyledCheckboxLabel } from '../../Styles/HrmStyles';

const CaseInformationTab = ({ caseInformation, handleCheckboxClick, defaultEventHandlers }) => (
  <Container>
    <TwoColumnLayout>
      <ColumnarBlock>
        <FieldText
          id="CaseInformation_CallSummary"
          label="Call summary"
          field={caseInformation.callSummary}
          rows={10}
          {...defaultEventHandlers(['caseInformation'], 'callSummary')}
        />

        <FieldSelect
          field={caseInformation.referredTo}
          id="CaseInformation_ReferredTo"
          name="referredTo"
          label="Referred To"
          options={['No Referral', 'Referral 1', 'Referral 2', 'Referral 3']}
          {...defaultEventHandlers(['caseInformation'], 'referredTo')}
        />

        <FieldSelect
          field={caseInformation.status}
          id="CaseInformation_Status"
          name="status"
          label="Status"
          options={['Open', 'In Progress', 'Closed']}
          {...defaultEventHandlers(['caseInformation'], 'status')}
        />

        <FieldSelect
          field={caseInformation.howDidTheChildHearAboutUs}
          id="CaseInformation_HowDidTheChildHearAboutUs"
          name="howDidTheChildHearAboutUs"
          label="How did the child hear about us?"
          options={['Word of Mouth', 'Media', 'Friend', 'School']}
          {...defaultEventHandlers(['caseInformation'], 'howDidTheChildHearAboutUs')}
        />
      </ColumnarBlock>

      <ColumnarBlock>
        <CheckboxField>
          <Checkbox
            name="keepConfidential"
            id="CaseInformation_KeepConfidential"
            checked={caseInformation.keepConfidential.value}
            onClick={() =>
              handleCheckboxClick(['caseInformation'], 'keepConfidential', !caseInformation.keepConfidential.value)
            }
          />
          <StyledCheckboxLabel htmlFor="CaseInformation_KeepConfidential">Keep Confidential?</StyledCheckboxLabel>
        </CheckboxField>

        <CheckboxField>
          <Checkbox
            name="okForCaseWorkerToCall"
            id="CaseInformation_OkForCaseWorkerToCall"
            checked={caseInformation.okForCaseWorkerToCall.value}
            onClick={() =>
              handleCheckboxClick(
                ['caseInformation'],
                'okForCaseWorkerToCall',
                !caseInformation.okForCaseWorkerToCall.value,
              )
            }
          />
          <StyledCheckboxLabel htmlFor="CaseInformation_OkForCaseWorkerToCall">
            OK for case worker to call?
          </StyledCheckboxLabel>
        </CheckboxField>

        <CheckboxField>
          <Checkbox
            name="didYouDiscussRightsWithTheChild"
            id="CaseInformation_DidYouDiscussRightsWithTheChild"
            checked={caseInformation.didYouDiscussRightsWithTheChild.value}
            onClick={() =>
              handleCheckboxClick(
                ['caseInformation'],
                'didYouDiscussRightsWithTheChild',
                !caseInformation.didYouDiscussRightsWithTheChild.value,
              )
            }
          />
          <StyledCheckboxLabel htmlFor="CaseInformation_DidYouDiscussRightsWithTheChild">
            Did you discuss rights with the child?
          </StyledCheckboxLabel>
        </CheckboxField>

        <CheckboxField>
          <Checkbox
            name="didTheChildFeelWeSolvedTheirProblem"
            id="CaseInformation_DidTheChildFeelWeSolvedTheirProblem"
            checked={caseInformation.didTheChildFeelWeSolvedTheirProblem.value}
            onClick={() =>
              handleCheckboxClick(
                ['caseInformation'],
                'didTheChildFeelWeSolvedTheirProblem',
                !caseInformation.didTheChildFeelWeSolvedTheirProblem.value,
              )
            }
          />
          <StyledCheckboxLabel htmlFor="CaseInformation_DidTheChildFeelWeSolvedTheirProblem">
            Did the child feel we solved their problem?
          </StyledCheckboxLabel>
        </CheckboxField>

        <CheckboxField>
          <Checkbox
            name="wouldTheChildRecommendUsToAFriend"
            id="CaseInformation_WouldTheChildRecommendUsToAFriend"
            checked={caseInformation.wouldTheChildRecommendUsToAFriend.value}
            onClick={() =>
              handleCheckboxClick(
                ['caseInformation'],
                'wouldTheChildRecommendUsToAFriend',
                !caseInformation.wouldTheChildRecommendUsToAFriend.value,
              )
            }
          />
          <StyledCheckboxLabel htmlFor="CaseInformation_WouldTheChildRecommendUsToAFriend">
            Would the child recommend us to a friend?
          </StyledCheckboxLabel>
        </CheckboxField>
      </ColumnarBlock>
    </TwoColumnLayout>
  </Container>
);

CaseInformationTab.displayName = 'CaseInformationTab';
CaseInformationTab.propTypes = {
  caseInformation: caseInformationType.isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  defaultEventHandlers: PropTypes.func.isRequired,
};

export default CaseInformationTab;
