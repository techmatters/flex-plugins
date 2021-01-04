/* eslint-disable react/prop-types */
import React from 'react';
import { Grid } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { SectionDescriptionText, SectionValueText } from '../styles/search';
import { formatValue } from './common/forms/helpers';
import type { FormItemDefinition, LayoutValue } from './common/forms/types';

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
  notBold?: boolean;
  layout?: LayoutValue;
};

const SectionEntry: React.FC<Props> = ({ description, value, definition, layout, notBold }) => {
  const formatted = presentValue(formatValue(layout)(value))(definition);

  return (
    <Grid container style={{ marginTop: 8, marginBottom: 8 }}>
      <Grid item xs={6}>
        <SectionDescriptionText>{description}</SectionDescriptionText>
      </Grid>
      <Grid item xs={6}>
        <SectionValueText notBold={notBold}>{formatted}</SectionValueText>
      </Grid>
    </Grid>
  );
};

SectionEntry.displayName = 'SectionEntry';

export default SectionEntry;
