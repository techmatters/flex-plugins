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

import { namespace } from '../states/storeNamespaces';
import { RootState } from '../states';
import { getCurrentBaseRoute, getCurrentTopmostRouteStackForTask } from '../states/routing/getRoute';
import { isRouteModal } from '../states/routing/types';
import { changeRoute, newCloseModalAction, newGoBackAction } from '../states/routing/actions';
import { Contact, CustomITask } from '../types/types';
import * as CaseActions from '../states/case/actions';
import * as RoutingActions from '../states/routing/actions';
import { Container, HeaderCloseButton, HiddenText, Row, StyledBackButton } from '../styles/HrmStyles';
import { BackIcon, SearchTitle } from '../styles/search';

type OwnProps = {
  task: CustomITask;
  titleCode: string;
  onGoBack?: () => void;
};

const mapStateToProps = (
  { [namespace]: { searchContacts, configuration, routing } }: RootState,
  { task }: OwnProps,
) => {
  const taskId = task.taskSid;
  const routeStack = getCurrentTopmostRouteStackForTask(routing, taskId);
  return {
    routing: routeStack[routeStack.length - 1],
    hasHistory: routeStack.length > 1,
    isModal: isRouteModal(getCurrentBaseRoute(routing, taskId)),
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
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const NavigableContainer: React.FC<Props> = ({
  children,
  goBack,
  onGoBack = () => goBack(),
  closeModal,
  titleCode,
  hasHistory,
  isModal,
}) => {
  return (
    <Container>
      <Row>
        {hasHistory && (
          <StyledBackButton
            onClick={() => {
              onGoBack();
            }}
          >
            <Row>
              <BackIcon />
            </Row>
          </StyledBackButton>
        )}
        <SearchTitle data-testid="Search-Title">
          <Template code={titleCode} />
        </SearchTitle>
        {isModal && (
          <HeaderCloseButton
            onClick={closeModal}
            data-testid="Case-CloseCross"
            style={{ marginRight: '15px', opacity: '.75' }}
          >
            <HiddenText>
              <Template code="Case-CloseButton" />
            </HiddenText>
            <Close />
          </HeaderCloseButton>
        )}
      </Row>
      {children}
    </Container>
  );
};

export default connector(NavigableContainer);
