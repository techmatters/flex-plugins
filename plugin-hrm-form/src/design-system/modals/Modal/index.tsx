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
import { CircularProgress, Template } from '@twilio/flex-ui';
import ModalBase from '@material-ui/core/Modal';
import { useDispatch, useSelector } from 'react-redux';

import { TertiaryButton, PrimaryButton, CloseButton, StyledBackButton } from '../../../styles/buttons';
import { Box, Row } from '../../../styles/layout';
import { getCurrentTopmostRouteForTask, getCurrentTopmostRouteStackForTask } from '../../../states/routing/getRoute';
import { namespace } from '../../../states/storeNamespaces';
import { RootState } from '../../../states';
import { newCloseModalAction, newGoBackAction } from '../../../states/routing/actions';
import { isRouteWithModalSupport } from '../../../states/routing/types';
import { ButtonGroup } from '../styles';
import { CloseDialog } from '../CloseDialog';
import { ModalPaper, ModalTitle } from './styles';
import { LargeBackIcon } from '../../../components/NavigableContainer/styles';
import { HiddenText } from '../../../styles';
import { getTemplate } from '../getTemplate';

export type Props = {
  templateCodes: {
    header: string | React.ReactElement;
    primaryButton: string | React.ReactElement;
    cancelDialog: {
      header: string | React.ReactElement;
      content: string | React.ReactElement;
    };
  };
  isOpen: boolean;
  isDirty: boolean;
  onClickPrimaryButton: () => void;
  taskSid: string;
  onClose?: () => void;
  isPrimaryButtonDisabled?: boolean;
  isLoading?: boolean;
  registerForceCloseRef?: React.MutableRefObject<null | (() => void)>;
};

export const Modal: React.FC<Props> = ({
  templateCodes,
  isOpen,
  isDirty,
  onClose,
  onClickPrimaryButton,
  children,
  taskSid,
  isPrimaryButtonDisabled = false,
  isLoading = false,
  registerForceCloseRef,
}) => {
  const dispatch = useDispatch();
  const [openDiscardDialog, setOpenDiscardDialog] = React.useState(false);
  const routing = useSelector((state: RootState) => state[namespace].routing);

  const routeStack = getCurrentTopmostRouteStackForTask(routing, taskSid);
  const currentRoute = getCurrentTopmostRouteForTask(routing, taskSid);
  const hasHistory = isRouteWithModalSupport(currentRoute) && routeStack.length > 1;
  const disableExitModal = isLoading;
  const disablePrimaryButton = isPrimaryButtonDisabled || isLoading;

  const goBack = () => {
    if (disableExitModal) {
      return;
    }

    dispatch(newGoBackAction(taskSid));
  };

  const closeModal = React.useCallback(() => {
    if (disableExitModal) {
      return;
    }

    if (onClose) {
      onClose();
    }
    dispatch(newCloseModalAction(taskSid));
  }, [dispatch, onClose, taskSid, disableExitModal]);

  const onCloseModal = () => {
    if (disableExitModal) {
      return;
    }

    if (isDirty && !openDiscardDialog) {
      setOpenDiscardDialog(true);
    } else {
      setOpenDiscardDialog(false);
      closeModal();
    }
  };

  React.useEffect(() => {
    if (registerForceCloseRef && !registerForceCloseRef.current) {
      registerForceCloseRef.current = closeModal;
    }
  }, [closeModal, registerForceCloseRef]);

  return (
    <ModalBase open={isOpen} onClose={onCloseModal} aria-labelledby="queue-selection-modal-title">
      <ModalPaper style={{ display: 'flex', flexDirection: 'column' }}>
        <Box marginBottom="20px">
          <Row>
            {hasHistory && (
              <StyledBackButton style={{ marginRight: '10px' }} onClick={goBack}>
                <LargeBackIcon />
                <HiddenText>
                  <Template code="NavigableContainer-BackButton" />
                </HiddenText>
              </StyledBackButton>
            )}
            <ModalTitle>{getTemplate(templateCodes.header)}</ModalTitle>
            <Box style={{ marginLeft: 'auto' }}>
              <CloseButton aria-label="CloseButton" onClick={onCloseModal} disabled={disableExitModal} />
            </Box>
          </Row>
        </Box>

        <Box
          style={{
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            justifyContent: 'start',
            alignItems: 'center',
            maxHeight: '160px',
            padding: '20px',
            overflow: 'auto',
          }}
        >
          {children}
        </Box>

        <ButtonGroup>
          <TertiaryButton type="button" onClick={onCloseModal} disabled={disableExitModal}>
            <Template code="BottomBar-Cancel" />
          </TertiaryButton>
          <PrimaryButton onClick={onClickPrimaryButton} disabled={disablePrimaryButton}>
            {getTemplate(templateCodes.primaryButton)}
            {isLoading && (
              <Box
                style={{
                  display: 'flex',
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  zIndex: 10,
                }}
              >
                <CircularProgress size={12} borderWidth={2} animating />
              </Box>
            )}
          </PrimaryButton>
        </ButtonGroup>

        <CloseDialog
          closeDialogHeader={getTemplate(templateCodes.cancelDialog.header)}
          closeDialogContent={getTemplate(templateCodes.cancelDialog.content)}
          openDialog={openDiscardDialog}
          onDiscardChanges={onCloseModal}
          onCloseDialog={() => setOpenDiscardDialog(false)}
        />
      </ModalPaper>
    </ModalBase>
  );
};
