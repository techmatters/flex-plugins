/* eslint-disable react/prop-types */
import React from 'react';
import { Grid } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { SectionDescriptionText, SectionValueText } from '../styles/search';
import { formatValue } from './common/forms/helpers';
import type { FormItemDefinition, LayoutValue } from './common/forms/types';
import { presentValue } from '../utils/formatters';
import DownloadFile from './common/forms/DownloadFile';

type Props = {
  description: React.ReactNode | string;
  value: string | number | boolean;
  definition?: FormItemDefinition;
  notBold?: boolean;
  layout?: LayoutValue;
};

const SectionEntry: React.FC<Props> = ({ description, value, definition, layout, notBold }) => {
  const formatted = presentValue(formatValue(layout)(value))(definition);

  const getValue = () => {
    if (definition && definition.type === 'file-upload' && value !== null)
      return <DownloadFile fileNameAtAws={formatted} />;

    return <SectionValueText notBold={notBold}>{formatted}</SectionValueText>;
  };

  return (
    <Grid container style={{ marginTop: 8, marginBottom: 8 }}>
      <Grid item xs={6}>
        <SectionDescriptionText>{description}</SectionDescriptionText>
      </Grid>
      <Grid item xs={6}>
        {getValue()}
      </Grid>
    </Grid>
  );
};

SectionEntry.displayName = 'SectionEntry';

export default SectionEntry;
