import React from 'react';
import type { FormItemDefinition, LayoutValue } from 'hrm-form-definitions';
import { Template } from '@twilio/flex-ui';

import { formatValue } from '../helpers';
import { presentValue } from '../../../../utils/formatters';
import DownloadFile from '../DownloadFile';
import { SectionValueText } from '../../../../styles/search';
import { Flex } from '../../../../styles/HrmStyles';

type Props = {
  value: string | number | boolean;
  notBold?: boolean;
  definition?: FormItemDefinition;
  layout?: LayoutValue;
};

/**
 * Presentational component used to nicely consume the form values in SectionEntry
 */
const SectionEntryValue: React.FC<Props> = ({ value, definition, layout, notBold }) => {
  if (definition && definition.type === 'file-upload' && typeof value === 'string' && value !== null) {
    return <DownloadFile fileNameAtAws={value} />;
  }

  const presentValueTemplate = presentValue(
    code => <Template code={code} />,
    codes => <Flex flexDirection="column">{codes}</Flex>,
  );
  const formatted = presentValueTemplate(formatValue(layout)(value))(definition);

  return <SectionValueText notBold={notBold}>{formatted}</SectionValueText>;
};

export default SectionEntryValue;
