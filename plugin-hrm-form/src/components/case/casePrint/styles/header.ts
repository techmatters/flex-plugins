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

const headerStyles: ReactPDF.Styles = {
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  childName: {
    fontFamily: 'Roboto',
    fontSize: 24,
    fontWeight: 600,
  },
  caseId: {
    fontFamily: 'Roboto',
    fontSize: 18,
  },
  officeName: {
    fontFamily: 'Roboto',
    fontSize: 10,
    marginLeft: 5,
  },
  logo: {
    maxWidth: 275,
    maxHeight: 80,
    objectFit: 'scale-down',
  },
};

export default headerStyles;
