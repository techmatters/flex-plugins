/* eslint-disable react/prop-types */
import React from 'react';
import { Grid } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import type { FormItemDefinition, LayoutValue } from 'hrm-form-definitions';

import { SectionActionButton, SectionDescriptionText, SectionValueText, ContactDetailsIcon } from '../styles/search';
import { formatValue } from './common/forms/helpers';
import { presentValue } from '../utils/formatters';
import DownloadFile from './common/forms/DownloadFile';
import { getConfig } from '../HrmFormPlugin';

const EditIcon = ContactDetailsIcon(Edit);

type Props = {
  description?: React.ReactNode | string;
  value?: string | number | boolean;
  definition?: FormItemDefinition;
  notBold?: boolean;
  layout?: LayoutValue;
  externalReport?: boolean;
};

const SectionEntry: React.FC<Props> = ({ description, value, definition, layout, notBold, externalReport }) => {
  const { strings } = getConfig();
  const formatted = presentValue(formatValue(layout)(value), strings)(definition);

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
      {externalReport && (
        <>
          <Grid item xs={6}>
            <SectionDescriptionText>{'External Report(s) Filed'}</SectionDescriptionText>
          </Grid>
          <SectionActionButton padding="5px 5px 5px 50px" type="button">
            <EditIcon style={{ fontSize: '14px', padding: '3px 2px 0 6px' }} />
            <Grid item xs={6}>
              {'Add'}
            </Grid>
          </SectionActionButton>
        </>
      )}
    </Grid>
  );
};

SectionEntry.displayName = 'SectionEntry';

export default SectionEntry;
