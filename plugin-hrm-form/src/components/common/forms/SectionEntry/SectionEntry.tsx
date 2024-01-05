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

/* eslint-disable react/prop-types */
import React from 'react';
import { Grid } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { SectionDescriptionText } from '../../../search/styles';

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
