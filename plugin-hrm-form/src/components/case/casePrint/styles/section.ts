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

const sectionStyles: ReactPDF.Styles = {
  sectionHeader: {
    marginTop: 20,
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 5,
    fontFamily: 'Roboto',
    backgroundColor: 'black',
    fontWeight: 600,
  },
  whiteText: {
    textTransform: 'uppercase',
    fontFamily: 'Roboto',
    fontSize: 10,
    letterSpacing: 1.67,
    color: 'white',
  },
  sectionBody: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  sectionItemRowEven: {
    fontFamily: 'Roboto',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionItemRowOdd: {
    fontFamily: 'Roboto',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f5f5f5',
  },
  sectionItemFirstColumn: {
    width: '50%',
  },
  sectionItemSecondColumn: {
    width: '50%',
    fontWeight: 600,
  },
};

export default sectionStyles;
