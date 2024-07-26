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

import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import React from 'react';
import { Close } from '@material-ui/icons';
import { StyledProps } from '@material-ui/core';

import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import { getCurrentBaseRoute, getCurrentTopmostRouteStackForTask } from '../../states/routing/getRoute';
import { isRouteModal } from '../../states/routing/types';
import { changeRoute, newCloseModalAction, newGoBackAction } from '../../states/routing/actions';
import { Contact, CustomITask, StandaloneITask } from '../../types/types';
import { Box, HiddenText, Row } from '../../styles';
import { StyledBackButton, HeaderCloseButton } from '../../styles/buttons';
import { LargeBackIcon, NavigableContainerBox, NavigableContainerContentBox, NavigableContainerTitle } from './styles';
import useFocus from '../../utils/useFocus';

type FocusTarget = 'back' | 'close';

type OwnProps = {
  task: CustomITask | StandaloneITask;
  titleCode: string;
  titleValues?: Record<string, string>;
  onGoBack?: () => void;
  onCloseModal?: () => void;
  focusPriority: FocusTarget[];
  noOverflow?: boolean;
};

const mapStateToProps = ({ [namespace]: { routing } }: RootState, { task: { taskSid } }: OwnProps) => {
  const routeStack = getCurrentTopmostRouteStackForTask(routing, taskSid);
  return {
    routing: routeStack[routeStack.length - 1],
    hasHistory: routeStack.length > 1,
    isModal: isRouteModal(getCurrentBaseRoute(routing, taskSid)),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    goBack: () => dispatch(newGoBackAction(taskId)),
    closeModal: () => {
      dispatch(newCloseModalAction(taskId));
    },
    viewContactDetails: ({ id }: Contact) => {
      dispatch(changeRoute({ route: 'contact', subroute: 'view', id: id.toString() }, taskId));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector> & StyledProps;

const NavigableContainer: React.FC<Props> = ({
  children,
  goBack,
  onGoBack = () => goBack(),
  closeModal,
  onCloseModal = () => closeModal(),
  titleCode,
  titleValues = {},
  hasHistory,
  isModal,
  focusPriority = ['back', 'close'],
  routing,
  noOverflow,
  ...boxProps
}) => {
  const validFocusPriority = (focusPriority ?? []).filter(
    target => (target === 'back' && hasHistory) || (target === 'close' && isModal),
  );
  const initialFocusRef = useFocus(Boolean(validFocusPriority.length), [routing]);

  const shouldFocus = (target: FocusTarget): boolean => validFocusPriority.indexOf(target) === 0;

  return (
    <NavigableContainerBox modal={isModal} {...boxProps}>
      <Row style={{ alignItems: 'start' }}>
        <Box width="30px">
          {hasHistory && (
            <StyledBackButton
              style={{ marginTop: '10px', marginRight: '5px' }}
              onClick={onGoBack}
              data-testid="NavigableContainer-BackButton"
              ref={ref => {
                if (shouldFocus('back')) {
                  initialFocusRef.current = ref;
                }
              }}
            >
              <LargeBackIcon />
              <HiddenText>
                <Template code="NavigableContainer-BackButton" />
              </HiddenText>
            </StyledBackButton>
          )}
        </Box>
        <NavigableContainerTitle data-testid="NavigableContainer-Title">
          <Template code={titleCode} {...titleValues} />
        </NavigableContainerTitle>
        {isModal && (
          <HeaderCloseButton
            onClick={onCloseModal}
            data-testid="NavigableContainer-CloseCross"
            style={{ marginRight: '15px', opacity: '.75' }}
            ref={ref => {
              if (shouldFocus('close')) {
                initialFocusRef.current = ref;
              }
            }}
          >
            <HiddenText>
              <Template code="NavigableContainer-CloseButton" /> <Template code={titleCode} />
            </HiddenText>
            <Close />
          </HeaderCloseButton>
        )}
      </Row>
      <NavigableContainerContentBox noOverflow={noOverflow}>{children}</NavigableContainerContentBox>
    </NavigableContainerBox>
  );
};

export default connector(NavigableContainer);
