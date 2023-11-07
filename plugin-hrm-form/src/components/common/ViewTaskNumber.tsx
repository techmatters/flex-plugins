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
import { ITask, Template, ThemeProps } from '@twilio/flex-ui';
import { Paper, Popper } from '@material-ui/core';

import { getFormattedNumberFromTask } from '../../utils';
import EyeOpenIcon from './icons/EyeOpenIcon';
import EyeCloseIcon from './icons/EyeCloseIcon';
import { HiddenText, Box, PhoneNumberPopperText, StyledUnmaskButton } from '../../styles/HrmStyles';
import { CloseButton } from '../../styles/callTypeButtons';

type Props = ThemeProps & { task?: ITask };

const ViewTaskNumber = ({ task }: Props) => {
  const [viewNumber, setViewNumber] = useState(false);
  const viewNumberRef = useRef(null);

  const toggleViewNumber = () => {
    setViewNumber(!viewNumber);
  };

  const handleClose = () => {
    setViewNumber(!viewNumber);
  };

  const renderTaskNumberPopper = () =>
    viewNumber ? (
      <Popper open={viewNumber} anchorEl={viewNumberRef.current} placement="bottom">
        <Paper style={{ width: '310px', padding: '25px' }}>
          <Box style={{ float: 'right' }}>
            <HiddenText id="CloseButton">
              <Template code="CloseButton" />
            </HiddenText>
            <CloseButton aria-label="CloseButton" onClick={handleClose} />
          </Box>
          <PhoneNumberPopperText>Phone Number Revealed</PhoneNumberPopperText>
          <br />
          {getFormattedNumberFromTask(task)}
        </Paper>
      </Popper>
    ) : null;

  return (
    <>
      <StyledUnmaskButton onClick={toggleViewNumber} ref={viewNumberRef}>
        {viewNumber ? <EyeOpenIcon /> : <EyeCloseIcon />}
      </StyledUnmaskButton>
      {renderTaskNumberPopper()}
    </>
  );
};

export default ViewTaskNumber;
