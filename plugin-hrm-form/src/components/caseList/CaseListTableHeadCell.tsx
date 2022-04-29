/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';
import { ExpandMore } from '@material-ui/icons';
import { connect, ConnectedProps } from 'react-redux';

import { getConfig } from '../../HrmFormPlugin';
import { CLTableHeaderFont, CLTableCell } from '../../styles/caseList';
import { ListCasesQueryParams, ListCasesSortDirection } from '../../types/types';
import * as CaseListSettingsActions from '../../states/caseList/settings';
import { caseListBase, namespace, RootState } from '../../states';

type SortDirection = ListCasesQueryParams['sortDirection'];
type SortBy = ListCasesQueryParams['sortBy'];

type OwnProps = {
  column?: SortBy;
  defaultSortDirection?: SortDirection;
  localizedText?: string;
  width?: string;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const changeSortDirection = (sortDirection: SortDirection): SortDirection =>
  sortDirection === ListCasesSortDirection.ASC ? ListCasesSortDirection.DESC : ListCasesSortDirection.ASC;

/**
 * If column prop is filled, the cell will enable sorting by this column
 */
const CaseListTableHeadCell: React.FC<Props> = ({
  column,
  defaultSortDirection = ListCasesSortDirection.DESC,
  localizedText,
  width,
  currentSort,
  updateCaseListSort,
}) => {
  const { featureFlags } = getConfig();

  const drawSort = () => {
    if (!featureFlags.enable_sort_cases) return null;
    if (!currentSort || !column || column !== currentSort.sortBy) return null;

    return (
      <ExpandMore
        style={{
          fontSize: 20,
          marginLeft: '10px',
          verticalAlign: 'middle',
          transform: currentSort.sortDirection === ListCasesSortDirection.ASC ? 'rotate(180deg) scaleX(-1)' : 'none',
        }}
      />
    );
  };

  const borderBottom = () => {
    if (!featureFlags.enable_sort_cases || !column) return 'none';
    return currentSort?.sortBy === column ? '3px solid #009DFF' : 'none';
  };

  const cursor = () => {
    if (!featureFlags.enable_sort_cases) return 'auto';
    return column ? 'pointer' : 'auto';
  };

  const handleClick = async () => {
    if (!featureFlags.enable_sort_cases) return;
    if (!column) return;

    const isDifferentColumn = column !== currentSort?.sortBy;
    const updatedSortDirection = isDifferentColumn
      ? defaultSortDirection
      : changeSortDirection(currentSort?.sortDirection);

    updateCaseListSort({ sortBy: column, sortDirection: updatedSortDirection });
  };

  return (
    <CLTableCell style={{ width: width || '8%', cursor: cursor() }} onClick={handleClick}>
      <CLTableHeaderFont style={{ borderBottom: borderBottom(), whiteSpace: 'nowrap' }}>
        <Template code={localizedText} /> {drawSort()}
      </CLTableHeaderFont>
    </CLTableCell>
  );
};

CaseListTableHeadCell.displayName = 'CaseListTableHeadCell';

const mapDispatchToProps = {
  updateCaseListSort: CaseListSettingsActions.updateCaseListSort,
};

const mapStateToProps = (state: RootState) => ({
  currentSort: state[namespace][caseListBase].currentSettings.sort,
  currentSortCompare: JSON.stringify(state[namespace][caseListBase].currentSettings.sort),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CaseListTableHeadCell);

export default connected;
