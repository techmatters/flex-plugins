/* eslint-disable react/prop-types */
import React from 'react';
import { Grid } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { SectionDescriptionText } from '../../../../styles/search';

type Props = {
  description: string | React.ReactNode;
};

const SectionEntry: React.FC<Props> = ({ description, children }) => {
  return (
    <Grid container style={{ marginTop: 8, marginBottom: 8 }}>
      <Grid item xs={6}>
        <SectionDescriptionText>
          {typeof description === 'string' ? <Template code={description} /> : description}
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
