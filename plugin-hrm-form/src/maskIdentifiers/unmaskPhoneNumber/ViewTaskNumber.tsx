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
import React, { useRef, useState } from 'react';
import { Template, ThemeProps } from '@twilio/flex-ui';
import { Paper, Popper } from '@material-ui/core';

import { getFormattedNumberFromTask } from '../../utils';
import EyeOpenIcon from './EyeOpenIcon';
import EyeCloseIcon from './EyeCloseIcon';
import { PhoneNumberPopperText, UnmaskStyledButton } from './styles';
import { Box, HiddenText } from '../../styles';
import { CloseButton } from '../../components/callTypeButtons/styles';

type Props = ThemeProps & { task?: ITask; isSupervisor?: boolean };

const ViewTaskNumber = ({ task, isSupervisor }: Props) => {
  const [viewNumber, setViewNumber] = useState(false);
  const viewNumberRef = useRef(null);

  const toggleViewNumber = () => {
    setViewNumber(!viewNumber);
  };

  return (
    <>
      <UnmaskStyledButton
        onClick={toggleViewNumber}
        ref={viewNumberRef}
        style={isSupervisor ? { position: 'fixed', alignSelf: 'center', marginRight:'5rem'} : {}}
      >
        {viewNumber ? <EyeOpenIcon /> : <EyeCloseIcon />}
      </UnmaskStyledButton>
      {viewNumber ? (
        <Popper open={viewNumber} anchorEl={viewNumberRef.current} placement="bottom">
          <Paper style={{ width: '250px', padding: '15px' }}>
            <Box style={{ float: 'right' }}>
              <HiddenText id="CloseButton">
                <Template code="CloseButton" />
              </HiddenText>
              <CloseButton aria-label="CloseButton" fontSizeSmall onClick={toggleViewNumber} />
            </Box>
            <PhoneNumberPopperText>
              <Template code="UnmaskPhoneNumber" />
            </PhoneNumberPopperText>
            <br />
            {getFormattedNumberFromTask(task)}
          </Paper>
        </Popper>
      ) : null}
    </>
  );
};

export default ViewTaskNumber;
