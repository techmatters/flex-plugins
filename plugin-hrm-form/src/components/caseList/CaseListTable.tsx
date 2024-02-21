/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/prop-types */
import React from 'react';
import { TableBody, CircularProgress } from '@material-ui/core';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import InfoIcon from '@material-ui/icons/Info';

import { TableContainer, StandardTable, DataTableRow, LoadingCell, DataCell, TableBodyFont } from '../../styles';
import Filters from './filters/Filters';
import CaseListTableHead from './CaseListTableHead';
import CaseListTableRow from './CaseListTableRow';
import Pagination from '../pagination';
import { CASES_PER_PAGE } from './CaseList';
import type { Case } from '../../types/types';
import * as CaseListSettingsActions from '../../states/caseList/settings';
import { PermissionActions, getInitializedCan } from '../../permissions';
import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';

const ROW_HEIGHT = 89;

type OwnProps = {
  loading: boolean;
  caseList: Case[];
  caseCount: number;
  handleClickViewCase: (currentCase: Case) => () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

/**
 * This component is splitted to make it easier to read, but is basically a 8 columns Table (8 for data, 1 for the "expand" button)
 */
const CaseListTable: React.FC<Props> = ({
  loading,
  caseList,
  caseCount,
  currentPage,
  updateCaseListPage,
  handleClickViewCase,
  counselorsHash,
  currentDefinitionVersion,
}) => {
  const can = React.useMemo(() => {
    return getInitializedCan();
  }, []);

  const pagesCount = Math.ceil(caseCount / CASES_PER_PAGE);

  return (
    <>
      <Filters caseCount={caseCount} currentDefinitionVersion={currentDefinitionVersion} />
      <TableContainer>
        <StandardTable tabIndex={0} aria-labelledby="CaseList-Cases-label" data-testid="CaseList-Table">
          <CaseListTableHead />
          {loading && (
            <TableBody>
              <DataTableRow
                data-testid="CaseList-Table-Loading"
                style={{
                  position: 'relative',
                  background: 'transparent',
                  height: `${(caseList.length || CASES_PER_PAGE) * ROW_HEIGHT}px`,
                }}
              >
                <LoadingCell>
                  <CircularProgress size={50} />
                </LoadingCell>
              </DataTableRow>
            </TableBody>
          )}
          {!loading && (
            <TableBody>
              {caseList.length > 0 ? (
                caseList.map(caseItem => {
                  return (
                    <CaseListTableRow
                      caseItem={caseItem}
                      key={`CaseListItem-${caseItem.id}`}
                      handleClickViewCase={currentCase =>
                        can(PermissionActions.VIEW_CASE, caseItem) ? handleClickViewCase(currentCase) : () => undefined
                      }
                      counselorsHash={counselorsHash}
                    />
                  );
                })
              ) : (
                <DataTableRow style={{ background: '#fffeef' }}>
                  <DataCell style={{ border: '1px solid #ffc811', verticalAlign: 'middle' }} colSpan={8}>
                    <InfoIcon fontSize="small" style={{ color: '#ffc811', margin: '0 6px -4px 6px' }} />
                    <Template code="CaseList-NoCases" />
                  </DataCell>
                </DataTableRow>
              )}
            </TableBody>
          )}
        </StandardTable>
      </TableContainer>
      {caseList.length > 0 ? (
        <div style={{ minHeight: '100px' }}>
          <Pagination
            transparent
            page={currentPage}
            pagesCount={pagesCount}
            handleChangePage={updateCaseListPage}
            disabled={loading}
          />
        </div>
      ) : null}
    </>
  );
};

CaseListTable.displayName = 'CaseListTable';

const mapStateToProps = ({ [namespace]: { configuration, caseList } }: RootState) => ({
  counselorsHash: configuration.counselors.hash,
  currentDefinitionVersion: configuration.currentDefinitionVersion,
  currentPage: caseList.currentSettings.page,
});

const mapDispatchToProps = {
  updateCaseListPage: CaseListSettingsActions.updateCaseListPage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CaseListTable);

export default connected;
