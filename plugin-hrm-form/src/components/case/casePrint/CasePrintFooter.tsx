/* eslint-disable react/prop-types */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';

import styles from './CasePrintStyles';

type OwnProps = {};

type Props = OwnProps;

const CasePrintFooter: React.FC<Props> = props => {
  return (
    <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
  );
};

CasePrintFooter.displayName = 'CasePrintFooter';

export default CasePrintFooter;
