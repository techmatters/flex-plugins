/* eslint-disable react/prop-types */
import React from 'react';
import { Grid } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { SectionDescriptionText } from '../../../../styles/search';

type Props = {
  descriptionKey: string;
  descriptionStyle?: React.CSSProperties;
  descrptionDetail?: string;
};

const SectionEntry: React.FC<Props> = ({ descriptionKey, descriptionStyle, descrptionDetail, children }) => {
  return (
    <Grid container style={{ marginTop: 8, marginBottom: 8 }}>
      <Grid item xs={6}>
        <SectionDescriptionText>
          <span style={descriptionStyle}>
            <Template code={descriptionKey} /> {descrptionDetail}
          </span>
        </SectionDescriptionText>
      </Grid>
      <Grid item xs={6}>
        {children}
      </Grid>
    </Grid>
  );
};

SectionEntry.displayName = 'SectionEntry';

export default SectionEntry;
