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
import { ButtonBase, Paper, Popper } from '@material-ui/core';

import { getFormattedNumberFromTask } from '../../utils';
import EyeOpenIcon from './icons/EyeOpenIcon';
import EyeCloseIcon from './icons/EyeCloseIcon';
import { HeaderCloseButton, HiddenText } from '../../styles/HrmStyles';
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
      <Popper open={viewNumber} anchorEl={viewNumberRef.current} placement="bottom-start">
        <Paper style={{ width: '200px', padding: '30px' }}>
          <HeaderCloseButton onClick={handleClose} style={{ marginRight: '15px', opacity: '.75' }}>
            <HiddenText>
              <Template code="CloseButton" />
            </HiddenText>
            <CloseButton/>
          </HeaderCloseButton>
          
          <h2>
            <strong> Phone Number Revealed</strong>
          </h2>
          {getFormattedNumberFromTask(task)}
        </Paper>
      </Popper>
    ) : null;

  return (
    <>
      <ButtonBase onClick={toggleViewNumber} ref={viewNumberRef}>
        {viewNumber ? <EyeOpenIcon /> : <EyeCloseIcon />}
      </ButtonBase>
      {renderTaskNumberPopper()}
    </>
  );
};

export default ViewTaskNumber;
