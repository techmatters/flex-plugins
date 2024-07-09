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

import * as ReactPDF from '@react-pdf/renderer';

const detailsStyles: ReactPDF.Styles = {
  caseDetailsContainer: {
    marginLeft: 5,
    marginRight: 5,
  },
  caseDetailsLabel: {
    marginBottom: 10,
    textTransform: 'uppercase',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 1.67,
  },
  caseDetailsSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
    backgroundColor: 'lightgray',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  caseDetailsSubSection: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 30,
    marginRight: 30,
    marginTop: 10,
    fontSize: 12,
  },
  caseCounsellorSection: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
  },
  caseDetailsBoldText: {
    marginTop: 5,
    fontWeight: 600,
  },
  imgCheckbox: {
    width: '20px',
    height: '20px',
    marginRight: '5px',
  },
};

export default detailsStyles;
