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
import { CircularProgress, styled, Template } from '@twilio/flex-ui';
import ModalBase from '@material-ui/core/Modal';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import Paper from '@material-ui/core/Paper';
import { useDispatch, useSelector } from 'react-redux';

import { TertiaryButton, PrimaryButton, DestructiveButton, CloseButton } from './buttons';
import { Box, Row } from './layout';
import SearchResultsBackButton from '../components/search/SearchResults/SearchResultsBackButton';
import { getCurrentTopmostRouteForTask, getCurrentTopmostRouteStackForTask } from '../states/routing/getRoute';
import { namespace } from '../states/storeNamespaces';
import { RootState } from '../states';
import { newCloseModalAction, newGoBackAction } from '../states/routing/actions';
import { isRouteWithModalSupport } from '../states/routing/types';

const ModalPaper = styled(Paper)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  max-width: 800px;
  max-height: 600px;
  background-color: white;
  padding: 20px;
  outline: none;
  border-radius: 4px;
`;

const ModalTitle = styled('h2')`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
`;

const ButtonGroup = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
`;

export type Props = {
  templateCodes: {
    header: string;
    primaryButton: string;
    backButton?: string;
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
    <ModalBase
      open={isOpen}
      onClose={onCloseModal}
      aria-labelledby="queue-selection-modal-title"
      style={{ padding: '16px' }}
    >
      <ModalPaper style={{ display: 'flex', flexDirection: 'column' }}>
        <Row>
          {hasHistory && (
            <SearchResultsBackButton
              handleBack={goBack}
              text={<Template code={templateCodes.backButton} disabled={disableExitModal} />}
            />
          )}
          <Box style={{ marginLeft: 'auto' }}>
            <CloseButton tabIndex={3} aria-label="CloseButton" onClick={onCloseModal} disabled={disableExitModal} />
          </Box>
        </Row>
        <Row style={{ width: '100%', justifyContent: 'center' }}>
          <Box width="fit-content" marginBottom="20px" justifyContent="center">
            <ModalTitle>
              <Template code={templateCodes.header} />
            </ModalTitle>
          </Box>
        </Row>

        <Box
          style={{
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            justifyContent: 'start',
            alignItems: 'center',
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
            <Template code={templateCodes.primaryButton} />
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
            {/* {isLoading ? <CircularProgress size={12} /> : <Template code={templateCodes.primaryButton} />} */}
          </PrimaryButton>
        </ButtonGroup>

        <CloseDialog
          closeDialogHeader="Are you sure you want to cancel enabling bulk skills?"
          closeDialogContent="Your changes will be discarded."
          openDialog={openDiscardDialog}
          onDiscardChanges={onCloseModal}
          onCloseDialog={() => setOpenDiscardDialog(false)}
        />
      </ModalPaper>
    </ModalBase>
  );
};

const CloseDialogHeader = styled('p')`
  font-size: 20px;
  font-weight: 700;
  align-self: center;
  text-align: center;
`;

const CloseDialogContent = styled('p')`
  font-size: 14px;
  margin: 20px 0;
`;

const CloseDialogPaper = styled((props: React.JSX.IntrinsicAttributes & DialogProps) => (
  <Dialog {...props} classes={{ paper: 'paper' }} />
))`
  && .paper {
    width: 60%;
    max-width: 600px;
  }
`;

const CloseDialog: React.FC<{
  openDialog: boolean;
  closeDialogHeader: string;
  closeDialogContent: string;
  onDiscardChanges: () => void;
  onCloseDialog: () => void;
}> = ({ openDialog, closeDialogHeader, closeDialogContent, onDiscardChanges, onCloseDialog }) => {
  return (
    <CloseDialogPaper open={openDialog} onClose={onCloseDialog}>
      <Box padding="30px">
        <CloseDialogHeader>
          <Template code={closeDialogHeader} />
        </CloseDialogHeader>
        <Box padding="20px 0">
          <CloseDialogContent>
            <Template code={closeDialogContent} />
          </CloseDialogContent>
        </Box>
        <ButtonGroup>
          <TertiaryButton tabIndex={1} onClick={onCloseDialog}>
            <Template code="Cancel" />
          </TertiaryButton>
          <DestructiveButton tabIndex={2} onClick={onDiscardChanges} style={{ margin: '0 15px' }}>
            <Template code="Discard Changes" />
          </DestructiveButton>
        </ButtonGroup>
      </Box>
    </CloseDialogPaper>
  );
};
