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

import { bindActionCreators } from 'redux';
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import React from 'react';
import { Close } from '@material-ui/icons';
import { StyledProps } from '@material-ui/core';

import { namespace } from '../states/storeNamespaces';
import { RootState } from '../states';
import { getCurrentBaseRoute, getCurrentTopmostRouteStackForTask } from '../states/routing/getRoute';
import { isRouteModal } from '../states/routing/types';
import { changeRoute, newCloseModalAction, newGoBackAction } from '../states/routing/actions';
import { Contact, CustomITask, StandaloneITask } from '../types/types';
import * as CaseActions from '../states/case/actions';
import * as RoutingActions from '../states/routing/actions';
import { HeaderCloseButton, HiddenText, Row, StyledBackButton } from '../styles/HrmStyles';
import { LargeBackIcon, NavigableContainerBox, NavigableContainerTitle } from '../styles/NavigableContainerStyles';
import { setSearchExistingCase } from '../states/search/actions';

type OwnProps = {
  task: CustomITask | StandaloneITask;
  titleCode: string;
  onGoBack?: () => void;
  onCloseModal?: () => void;
  searchCase?: boolean;
};

const mapStateToProps = (
  { [namespace]: { searchContacts, configuration, routing } }: RootState,
  { task: { taskSid } }: OwnProps,
) => {
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
    setConnectedCase: bindActionCreators(CaseActions.setConnectedCase, dispatch),
    changeRoute: bindActionCreators(RoutingActions.changeRoute, dispatch),
    searchExistingCase: (searchStatus: boolean) => dispatch(setSearchExistingCase(searchStatus, ownProps.task.taskSid)),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector> & StyledProps;

const NavigableContainer: React.FC<Props> = ({
  children,
  goBack,
  onGoBack = () => goBack(),
  closeModal,
  onCloseModal = () => closeModal(),
  titleCode,
  hasHistory,
  isModal,
  searchCase,
  ...boxProps
}) => {
  const handleCloseModal = () => {
    onCloseModal();

    if (searchCase) {
      boxProps.searchExistingCase(false);
    }
  };

  return (
    <NavigableContainerBox modal={isModal} {...boxProps}>
      <Row style={{ alignItems: 'start' }}>
        {hasHistory && (
          <StyledBackButton onClick={onGoBack} data-testid="NavigableContainer-BackButton">
            <Row style={{ paddingTop: '7px' }}>
              <LargeBackIcon />
              <HiddenText>
                <Template code="NavigableContainer-BackButton" />
              </HiddenText>
            </Row>
          </StyledBackButton>
        )}
        <NavigableContainerTitle data-testid="NavigableContainer-Title">
          <Template code={titleCode} />
        </NavigableContainerTitle>
        {isModal && (
          <HeaderCloseButton
            onClick={handleCloseModal}
            data-testid="NavigableContainer-CloseCross"
            style={{ marginRight: '15px', opacity: '.75' }}
          >
            <HiddenText>
              <Template code="NavigableContainer-CloseButton" />
            </HiddenText>
            <Close />
          </HeaderCloseButton>
        )}
      </Row>
      {children}
    </NavigableContainerBox>
  );
};

export default connector(NavigableContainer);
