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
import { Box } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import FormNotEditable from './FormNotEditable';
import { HeaderContainer, Row, StyledNextStepButton } from '../styles/HrmStyles';

type OwnProps = {
  onReload: () => Promise<void>;
  onFinish: () => Promise<void>;
};

type Props = OwnProps;

const ContactNotLoaded: React.FC<Props> = ({ onReload, onFinish }: Props) => {
  return (
    <Box style={{ padding: '20px' }}>
      <HeaderContainer style={{ marginBottom: '10px', fontSize: '24px' }}>
        <Template code="TabbedForms-ContactNotLoaded-Header" />
      </HeaderContainer>
      <Row>
        <StyledNextStepButton
          onClick={async e => {
            try {
              const reloadPromise = onReload();
              e.target.disabled = true;
              await reloadPromise;
            } finally {
              e.target.disabled = false;
            }
          }}
        >
          <Template code="TabbedForms-ContactNotLoaded-Retry" />
        </StyledNextStepButton>
        &nbsp;
        <StyledNextStepButton
          onClick={async e => {
            try {
              const finishPromise = onFinish();
              e.target.disabled = true;
              await finishPromise;
            } finally {
              e.target.disabled = false;
            }
          }}
        >
          <Template code="TabbedForms-ContactNotLoaded-Finish" />
        </StyledNextStepButton>
      </Row>
    </Box>
  );
};
ContactNotLoaded.displayName = 'FormNotEditable';

export default ContactNotLoaded;
