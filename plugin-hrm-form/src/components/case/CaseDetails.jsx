/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-empty-function */
/* eslint-disable react/jsx-max-depth */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';

import CaseTags from './CaseTags';
import CaseDetailsHeader from './caseDetails/CaseDetailsHeader';
import {
  DetailsContainer,
  DetailDescription,
  StyledInputField,
  StyledSelectField,
  StyledSelectWrapper,
} from '../../styles/case';
import { FormOption } from '../../styles/HrmStyles';
import { PermissionActions } from '../../permissions';

const CaseDetails = ({
  caseId,
  name,
  categories,
  counselor,
  openedDate,
  lastUpdatedDate,
  followUpDate,
  status,
  prevStatus,
  can,
  office,
  childIsAtRisk,
  handlePrintCase,
  handleInfoChange,
  handleStatusChange,
  handleClickChildIsAtRisk,
  definitionVersion,
  definitionVersionName,
  isOrphanedCase,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const statusOptions = React.useMemo(() => {
    const statusTransitions = [prevStatus, ...definitionVersion.caseStatus[prevStatus].transitions];

    const optionsArray = statusTransitions.reduce(
      (acc, curr) => [...acc, { value: curr, label: definitionVersion.caseStatus[curr].label }],
      [],
    );

    const enableBasedOnPermissions = o => {
      if (o.value === prevStatus) return true;
      if (o.value === 'closed' && prevStatus !== 'closed') return can(PermissionActions.CLOSE_CASE);
      if (o.value !== 'closed' && prevStatus === 'closed') return can(PermissionActions.REOPEN_CASE);

      return can(PermissionActions.CASE_STATUS_TRANSITION);
    };

    const renderStatusOptions = o => {
      const disabled = !enableBasedOnPermissions(o);

      return disabled ? null : (
        <FormOption key={o.value} value={o.value} style={{ color: definitionVersion.caseStatus[o.value].color }}>
          {o.label}
        </FormOption>
      );
    };

    return optionsArray.map(renderStatusOptions).filter(Boolean);
  }, [can, definitionVersion.caseStatus, prevStatus]);

  const onStatusChange = selectedOption => {
    handleStatusChange(selectedOption);
  };

  const canTransition = statusOptions.length !== 1;

  const color = definitionVersion.caseStatus[status].color || '#000000';
  const lastUpdatedClosedDate = openedDate === lastUpdatedDate ? '—' : lastUpdatedDate;

  return (
    <>
      <CaseDetailsHeader
        caseId={caseId}
        childName={name}
        counselor={counselor}
        childIsAtRisk={childIsAtRisk}
        office={office}
        handlePrintCase={handlePrintCase}
        handleClickChildIsAtRisk={handleClickChildIsAtRisk}
        isOrphanedCase={isOrphanedCase}
        can={can}
      />
      <DetailsContainer aria-labelledby="Case-CaseId-label">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseDetailsDateOpened">
                <Template code="Case-CaseDetailsDateOpened" />
              </label>
            </DetailDescription>
            <StyledInputField
              disabled
              id="Details_DateOpened"
              value={openedDate}
              aria-labelledby="CaseDetailsDateOpened"
            />
          </div>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseDetailsLastUpdated">
                <Template code="Case-CaseDetailsLastUpdated" />
              </label>
            </DetailDescription>
            <StyledInputField
              disabled
              id="Details_DateLastUpdated"
              value={lastUpdatedClosedDate}
              aria-labelledby="CaseDetailsLastUpdated"
            />
          </div>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseDetailsFollowUpDate">
                <Template code="Case-CaseDetailsFollowUpDate" />
              </label>
            </DetailDescription>
            <StyledInputField
              type="date"
              id="Details_DateFollowUp"
              name="Details_DateFollowUp"
              disabled={!can(PermissionActions.EDIT_FOLLOW_UP_DATE)}
              value={followUpDate}
              onChange={e => handleInfoChange('followUpDate', e.target.value)}
              aria-labelledby="CaseDetailsFollowUpDate"
            />
          </div>
          <div style={{ paddingRight: '20px' }}>
            <DetailDescription>
              <label id="CaseDetailsStatusLabel">
                <Template code="Case-CaseDetailsStatusLabel" />
              </label>
            </DetailDescription>
            <StyledSelectWrapper disabled={!canTransition}>
              <StyledSelectField
                id="Details_CaseStatus"
                name="Details_CaseStatus"
                aria-labelledby="CaseDetailsStatusLabel"
                disabled={!canTransition}
                onChange={e => onStatusChange(e.target.value)}
                defaultValue={status}
                color={color}
              >
                {statusOptions}
              </StyledSelectField>
            </StyledSelectWrapper>
          </div>
        </div>
        <div style={{ paddingTop: '15px' }}>
          <CaseTags definitionVersion={definitionVersionName} categories={categories} />
        </div>
      </DetailsContainer>
    </>
  );
};

CaseDetails.displayName = 'CaseDetails';
CaseDetails.propTypes = {
  caseId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  categories: PropTypes.array.isRequired,
  counselor: PropTypes.string.isRequired,
  openedDate: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  prevStatus: PropTypes.string.isRequired,
  can: PropTypes.func.isRequired,
  office: PropTypes.string,
  followUpDate: PropTypes.string,
  lastUpdatedDate: PropTypes.string,
  childIsAtRisk: PropTypes.bool.isRequired,
  handlePrintCase: PropTypes.func.isRequired,
  handleInfoChange: PropTypes.func.isRequired,
  handleStatusChange: PropTypes.func.isRequired,
  handleClickChildIsAtRisk: PropTypes.func.isRequired,
  definitionVersion: PropTypes.shape({}).isRequired,
  definitionVersionName: PropTypes.string.isRequired,
  isOrphanedCase: PropTypes.bool,
};

CaseDetails.defaultProps = {
  office: '',
  followUpDate: '',
  lastUpdatedDate: '',
  isOrphanedCase: false,
};

export default CaseDetails;
