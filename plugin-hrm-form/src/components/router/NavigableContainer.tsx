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
import { Template } from '@twilio/flex-ui';
import React from 'react';
import { Close } from '@material-ui/icons';
import { StyledProps } from '@material-ui/core';

import { RouterTask } from '../../types/types';
import { useModalRouting, useRoutingHistory } from '../../states/routing/hooks';
import { Box, HeaderCloseButton, HiddenText, Row, StyledBackButton } from '../../styles/HrmStyles';
import {
  LargeBackIcon,
  NavigableContainerBox,
  NavigableContainerContentBox,
  NavigableContainerTitle,
} from '../../styles/NavigableContainerStyles';

type OwnProps = {
  task: RouterTask;
  titleCode: string;
  hasHistory?: boolean;
  onGoBack?: () => void;
  onCloseModal?: () => void;
};

type Props = OwnProps & Partial<StyledProps>;

const NavigableContainer: React.FC<Props> = ({
  children,
  task,
  titleCode,
  hasHistory = true,
  onGoBack,
  onCloseModal,
  ...boxProps
}) => {
  const { activeModal, closeModal } = useModalRouting(task);
  const { goBack } = useRoutingHistory();

  const handleCloseModal = () => {
    if (onCloseModal) {
      return onCloseModal();
    }
    return closeModal();
  };

  const handleGoBack = () => {
    if (onGoBack) {
      return onGoBack();
    }
    if (activeModal) {
      return handleCloseModal();
    }
    return goBack();
  };

  return (
    <NavigableContainerBox modal={Boolean(activeModal)} {...boxProps}>
      <Row style={{ alignItems: 'start' }}>
        <Box width="30px">
          {hasHistory && (
            <StyledBackButton
              style={{ marginTop: '10px', marginRight: '5px' }}
              onClick={handleGoBack}
              data-testid="NavigableContainer-BackButton"
            >
              <LargeBackIcon />
              <HiddenText>
                <Template code="NavigableContainer-BackButton" />
              </HiddenText>
            </StyledBackButton>
          )}
        </Box>
        <NavigableContainerTitle data-testid="NavigableContainer-Title">
          <Template code={titleCode} />
        </NavigableContainerTitle>
        {activeModal && (
          <HeaderCloseButton
            onClick={handleCloseModal}
            data-testid="NavigableContainer-CloseCross"
            style={{ marginRight: '15px', opacity: '.75' }}
          >
            <HiddenText>
              <Template code="NavigableContainer-CloseButton" /> <Template code={titleCode} />
            </HiddenText>
            <Close />
          </HeaderCloseButton>
        )}
      </Row>
      <NavigableContainerContentBox>{children}</NavigableContainerContentBox>
    </NavigableContainerBox>
  );
};

export default NavigableContainer;
