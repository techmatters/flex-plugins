/* eslint-disable react/prop-types */
/* eslint-disable dot-notation */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';

import styles from './styles';

type OwnProps = {};

type Props = OwnProps;

const CasePrintFooter: React.FC<Props> = props => {
  return (
    <Text
      style={styles['footer']}
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      fixed
    />
  );
};

CasePrintFooter.displayName = 'CasePrintFooter';

export default CasePrintFooter;
