/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import React from 'react';
import type { FormItemDefinition, LayoutValue } from 'hrm-form-definitions';
import { Template } from '@twilio/flex-ui';

import { formatValue } from '../helpers';
import { presentValue } from '../../../../utils/formatters';
import DownloadFile from '../DownloadFile';
import { SectionValueText } from '../../../../styles/search';
import { Flex } from '../../../../styles/HrmStyles';

type Props = {
  value?: string | number | boolean;
  notBold?: boolean;
  definition?: FormItemDefinition;
  layout?: LayoutValue;
  objectId?: string | number;
};

/**
 * Presentational component used to nicely consume the form values in SectionEntry
 */
const SectionEntryValue: React.FC<Props> = ({ value, definition, layout, notBold, objectId }) => {
  if (definition && definition.type === 'file-upload' && typeof value === 'string' && value !== null) {
    return <DownloadFile fileNameAtAws={value} objectId={objectId as string} />;
  }

  const presentValueTemplate = presentValue(
    code => <Template code={code} />,
    codes => <Flex flexDirection="column">{codes}</Flex>,
  );
  const formatted = presentValueTemplate(formatValue(layout)(value))(definition);

  return <SectionValueText notBold={notBold}>{formatted}</SectionValueText>;
};

export default SectionEntryValue;
