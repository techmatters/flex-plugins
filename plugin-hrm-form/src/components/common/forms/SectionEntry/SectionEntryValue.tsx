import React from 'react';
import type { FormItemDefinition, LayoutValue } from 'hrm-form-definitions';
import { Template } from '@twilio/flex-ui';
import { Edit } from '@material-ui/icons';
import { Grid } from '@material-ui/core';

import { formatValue } from '../helpers';
import { presentValue } from '../../../../utils/formatters';
import DownloadFile from '../DownloadFile';
import { SectionValueText, SectionActionButton, ContactDetailsIcon } from '../../../../styles/search';
import { Flex } from '../../../../styles/HrmStyles';

const EditIcon = ContactDetailsIcon(Edit);

type Props = {
  value?: string | number | boolean;
  notBold?: boolean;
  definition?: FormItemDefinition;
  layout?: LayoutValue;
  csamReportEnabled?: boolean;
  handleEditClick?: () => void;
};

/**
 * Presentational component used to nicely consume the form values in SectionEntry
 */
const SectionEntryValue: React.FC<Props> = ({
  value,
  definition,
  layout,
  notBold,
  csamReportEnabled,
  handleEditClick,
}) => {
  if (definition && definition.type === 'file-upload' && typeof value === 'string' && value !== null) {
    return <DownloadFile fileNameAtAws={value} />;
  }

  if (csamReportEnabled) {
    return (
      <SectionActionButton padding="0" type="button" onClick={handleEditClick}>
        <EditIcon style={{ fontSize: '14px', padding: '-1px 6px 0 6px', marginRight: '6px' }} />
        <Grid item xs={12}>
          <Template code="ContactDetails-GeneralDetails-externalReport" />
        </Grid>
      </SectionActionButton>
    );
  }

  const presentValueTemplate = presentValue(
    code => <Template code={code} />,
    codes => <Flex flexDirection="column">{codes}</Flex>,
  );
  const formatted = presentValueTemplate(formatValue(layout)(value))(definition);

  return <SectionValueText notBold={notBold}>{formatted}</SectionValueText>;
};

export default SectionEntryValue;
