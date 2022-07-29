/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { DefinitionVersionId } from 'hrm-form-definitions';

import { getDefinitionVersion } from '../../services/ServerlessService';
import { configurationBase, namespace, RootState } from '../../states';
import * as ConfigActions from '../../states/configuration/actions';
import { Case, CounselorHash } from '../../types/types';
import {
  CLTableRow,
  CLTableCell,
  CLNamesCell,
  CLSummaryCell,
  CLNumberCell,
  CLTableBodyFont,
  CLCaseNumberContainer,
  CLCaseIDButton,
  CLTableSummaryFont,
} from '../../styles/caseList';
import { Box, HiddenText } from '../../styles/HrmStyles';
import { formatName, getShortSummary } from '../../utils';
import { getContactTags, renderTag } from '../../utils/categories';
import CategoryWithTooltip from '../common/CategoryWithTooltip';
import { getConfig } from '../../HrmFormPlugin';

const CHAR_LIMIT = 200;

// eslint-disable-next-line react/no-multi-comp
type OwnProps = {
  caseItem: Case;
  counselorsHash: CounselorHash;
  handleClickViewCase: (currentCase: Case) => () => void;
};

type Props = OwnProps & ConnectedProps<typeof connector>;

const CaseListTableRow: React.FC<Props> = ({ caseItem, counselorsHash, handleClickViewCase, ...props }) => {
  const { updateDefinitionVersion, definitionVersions } = props;
  const config = getConfig();
  let version = caseItem.info.definitionVersion;
  if (!Object.values(DefinitionVersionId).includes(version)) {
    console.warn(
      `Form definition version ${
        typeof version === 'string' ? `'${version}'` : version
      } does not exist in defined set: ${Object.values(
        DefinitionVersionId,
      )}. Falling back to to current configured version '${config.definitionVersion}' for case with id ${caseItem.id}`,
    );
    version = config.definitionVersion;
  }

  useEffect(() => {
    const fetchDefinitionVersions = async (v: string) => {
      const definitionVersion = await getDefinitionVersion(version);
      updateDefinitionVersion(version, definitionVersion);
    };
    if (version && !definitionVersions[version]) {
      fetchDefinitionVersions(version);
    }
  }, [definitionVersions, updateDefinitionVersion, version]);
  try {
    const { status } = caseItem;
    const statusString = status.charAt(0).toUpperCase() + status.slice(1);
    const name = formatName(caseItem.childName);
    const summary = caseItem.info && caseItem.info.summary;
    const shortSummary = getShortSummary(summary, CHAR_LIMIT, 'case');
    const counselor = formatName(counselorsHash[caseItem.twilioWorkerId]);
    const opened = `${format(new Date(caseItem.createdAt), 'MMM d, yyyy')}`;
    const beenUpdated = caseItem.createdAt !== caseItem.updatedAt;
    const updated = beenUpdated ? `${format(new Date(caseItem.updatedAt), 'MMM d, yyyy')}` : '—';
    const followUpDate =
      caseItem.info && caseItem.info.followUpDate
        ? `${format(parseISO(caseItem.info.followUpDate), 'MMM d, yyyy')}`
        : '—';
    const categories = getContactTags(version, caseItem.categories);

    const definitionVersion = definitionVersions[version];

    // Get the status for a case from the value of CaseStatus.json of the current form definitions
    const getCaseStatusLabel = (caseStatus: string) => {
      return Object.values(definitionVersion.caseStatus).filter(status => status.value === caseStatus)[0].label;
    };

    return (
      <CLTableRow data-testid="CaseList-TableRow" onClick={handleClickViewCase(caseItem)}>
        <CLNumberCell>
          <CLCaseNumberContainer>
            <CLCaseIDButton tabIndex={0} onClick={handleClickViewCase(caseItem)}>
              <HiddenText>
                <Template code={statusString} />
                <Template code="CaseList-THCase" />
              </HiddenText>
              {caseItem.id}
            </CLCaseIDButton>
            <CLTableBodyFont style={{ color: '#606B85', paddingTop: '2px', textAlign: 'center' }}>
              {getCaseStatusLabel(caseItem.status)}
            </CLTableBodyFont>
          </CLCaseNumberContainer>
        </CLNumberCell>
        <CLNamesCell>
          <CLTableBodyFont>{name}</CLTableBodyFont>
        </CLNamesCell>
        <CLTableCell>
          <CLTableBodyFont>{counselor}</CLTableBodyFont>
        </CLTableCell>
        <CLSummaryCell>
          <CLTableSummaryFont>{shortSummary}</CLTableSummaryFont>
        </CLSummaryCell>
        <CLTableCell>
          <div style={{ display: 'inline-block', flexDirection: 'column' }}>
            {categories &&
              categories.map(category => (
                <Box key={`category-tag-${category.label}`} marginBottom="5px">
                  <CategoryWithTooltip renderTag={renderTag} category={category.label} color={category.color} />
                </Box>
              ))}
          </div>
        </CLTableCell>
        <CLTableCell>
          <CLTableBodyFont style={{ textAlign: 'right' }}>{opened}</CLTableBodyFont>
        </CLTableCell>
        <CLTableCell>
          <CLTableBodyFont style={{ textAlign: 'right' }}>{updated}</CLTableBodyFont>
        </CLTableCell>
        <CLTableCell>
          <CLTableBodyFont style={{ textAlign: 'right' }}>{followUpDate}</CLTableBodyFont>
        </CLTableCell>
      </CLTableRow>
    );
  } catch (err) {
    console.error('Error rendering case row.', err);
    return (
      <CLTableRow>
        <CLTableCell colSpan={100}>
          <CLTableBodyFont>INVALID ROW</CLTableBodyFont>
        </CLTableCell>
      </CLTableRow>
    );
  }
};

CaseListTableRow.displayName = 'CaseListTableRow';

const mapStateToProps = (state: RootState) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
});

const mapDispatchToProps = {
  updateDefinitionVersion: ConfigActions.updateDefinitionVersion,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CaseListTableRow);

export default connected;
