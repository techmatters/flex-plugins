/* eslint-disable react/prop-types */
import React from 'react';
import { Grid } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { SectionDescriptionText, SectionValueText } from '../styles/search';
import type { FormItemDefinition } from './common/forms/types';

const presentValue = (value: string | number | boolean) => (definition: FormItemDefinition = null) => {
  if (definition && definition.type === 'mixed-checkbox' && value === null) return <Template code="Unknown" />;
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') {
    if (value) return <Template code="SectionEntry-Yes" />;
    return <Template code="SectionEntry-No" />;
  }

  return '-';
};

type Props = {
  description: React.ReactNode | string;
  value: string | number | boolean;
  definition?: FormItemDefinition;
};

const SectionEntry: React.FC<Props> = ({ description, value, definition }) => {
  return (
    <Grid container style={{ marginTop: 8, marginBottom: 8 }}>
      <Grid item xs={6}>
        <SectionDescriptionText>{description}</SectionDescriptionText>
      </Grid>
      <Grid item xs={6}>
        <SectionValueText>{presentValue(value)(definition)}</SectionValueText>
      </Grid>
    </Grid>
  );
};

SectionEntry.displayName = 'SectionEntry';

export default SectionEntry;
