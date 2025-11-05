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
import { useForm, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { styled, Template, useFlexSelector } from '@twilio/flex-ui';
import type { SupervisorState } from '@twilio/flex-ui/src/state/Supervisor/SupervisorState';

import { skillsOptions } from './teamsViewFilters';
import FormCheckbox from '../forms/components/FormCheckbox/FormCheckbox';
import { Box, Column, Row } from '../../styles/layout';
import { newTeamsViewSelectSkills, newUpdateWorkersSkillsAsyncAction } from '../../states/teamsView';
import { namespace } from '../../states/storeNamespaces';
import { RootState } from '../../states';
import { RouterTask } from '../../types/types';
import { changeRoute } from '../../states/routing/actions';
import Router, { RouteConfig } from '../router/Router';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { FontOpenSans } from '../../styles';
import asyncDispatch from '../../states/asyncDispatch';
import { Modal, Props as ModalProps } from '../../design-system/modals/Modal';

const TEAMS_VIEW_ROUTES: RouteConfig<Props> = [
  {
    shouldHandleRoute: routing => routing.route === 'teams' && routing.subroute === 'select-skills',
    renderComponent: (props: Props) => <SelectWorkersSkillsModal {...props} />,
  },
  {
    shouldHandleRoute: routing => routing.route === 'teams' && routing.subroute === 'confirm-update',
    renderComponent: (props: Props) => <ConfirmUpdatesModal {...props} />,
  },
];

const TeamsViewRouter: React.FC<Props> = props => {
  return <Router {...props} routeConfig={TEAMS_VIEW_ROUTES} />;
};

type Props = {
  task: RouterTask;
};

export const UpdateWorkersSkillsModal: React.FC<Props> = ({ task }) => {
  const dispatch = useDispatch();
  const {
    operation,
    selectedSkills,
    selectedWorkers,
    status: { loading },
  } = useSelector((state: RootState) => state[namespace].teamsView);
  const routing = useSelector((state: RootState) => state[namespace].routing);
  const topmostRoute = getCurrentTopmostRouteForTask(routing, task.taskSid);
  const registerForceCloseRef = React.useRef(null);

  const isDirty = Boolean(selectedSkills.size);

  const modalPropsByRoute: { [subroute: string]: ModalProps } = {
    'select-skills': {
      taskSid: task.taskSid,
      onClickPrimaryButton: () => {
        if (!isDirty) return;
        dispatch(changeRoute({ route: 'teams', subroute: 'confirm-update' }, task.taskSid));
      },
      isOpen: true,
      templateCodes: { header: `Select skills to ${operation}`, primaryButton: 'Next' },
      isDirty,
      isPrimaryButtonDisabled: !isDirty,
      registerForceCloseRef,
    },
    'confirm-update': {
      taskSid: task.taskSid,
      onClickPrimaryButton: async () => {
        try {
          if (!operation) {
            console.error('Mising operation parameter');
            return;
          }

          await asyncDispatch(dispatch)(
            newUpdateWorkersSkillsAsyncAction({
              operation,
              skills: Array.from(selectedSkills),
              workers: Array.from(selectedWorkers),
            }),
          );

          if (registerForceCloseRef.current && typeof registerForceCloseRef.current === 'function') {
            registerForceCloseRef.current();
          }
        } catch (err) {
          console.error(err);
        }
      },
      isOpen: true,
      templateCodes: {
        header: 'Confirm and Save',
        primaryButton: 'Confirm and Save',
        backButton: 'Return to Select Skills',
      },
      isDirty,
      isLoading: loading,
      registerForceCloseRef,
    },
  };

  if (!modalPropsByRoute[(topmostRoute as any).subroute]) {
    return null;
  }

  return (
    <Modal {...modalPropsByRoute[(topmostRoute as any).subroute]}>
      <TeamsViewRouter task={task} />
    </Modal>
  );
};

const SelectWorkersSkillsModal: React.FC<Props> = () => {
  const { selectedSkills } = useSelector((state: RootState) => state[namespace].teamsView);
  const dispatch = useDispatch();
  const methods = useForm();
  const { getValues } = methods;

  const renderSkillOptions = React.useMemo(() => {
    return skillsOptions.map(skill => (
      <FormCheckbox
        key={skill.value}
        label={skill.label}
        inputId={skill.value}
        initialValue={selectedSkills.has(skill.value)}
        updateCallback={() => {
          dispatch(
            newTeamsViewSelectSkills(
              Object.entries(getValues())
                .filter(([, v]) => v)
                .map(([k]) => k),
            ),
          );
        }}
        isEnabled
        htmlElRef={null}
        registerOptions={{ setValueAs: () => skill.value }}
      />
    ));
  }, [dispatch, getValues, selectedSkills]);

  return (
    <FormProvider {...methods}>
      <Row style={{ justifyContent: 'space-evenly', alignItems: 'start', width: '100%' }}>
        <Column style={{ width: '40%' }}>
          {renderSkillOptions.slice(0, Math.ceil(renderSkillOptions.length / 2))}
        </Column>
        <Column style={{ width: '40%' }}>{renderSkillOptions.slice(Math.ceil(renderSkillOptions.length / 2))}</Column>
      </Row>
    </FormProvider>
  );
};

const ConfirmUpdatesModal: React.FC<Props> = () => {
  const { selectedSkills, selectedWorkers, operation } = useSelector((state: RootState) => state[namespace].teamsView);
  const { workers } =
    useFlexSelector((state: RootState) => state.flex.supervisor) || ({ workers: [] } as SupervisorState);

  const selectedWorkersFlexState = workers.filter(w => selectedWorkers.has(w.worker.sid));

  const operationTemplateCode = `${operation} for`;

  return (
    <Column
      style={{ justifyContent: 'center', width: '100%', height: '100%', padding: '10px 30px', paddingRight: 'auto' }}
    >
      {Array.from(selectedSkills).map(skill => {
        const getWorkersForOperation = () => {
          if (operation === 'enable') {
            return selectedWorkersFlexState.filter(w => !w.worker.attributes.routing?.skills?.includes(skill)).length;
          }

          if (operation === 'disable') {
            return selectedWorkersFlexState.filter(w => !w.worker.attributes.disabled_skills?.skills?.includes(skill))
              .length;
          }

          return 0;
        };

        return (
          <Row style={{ width: '100%' }} key={skill}>
            <OperationText>{skill}:</OperationText>
            &nbsp;
            <OperationContentText>
              <Template code={operationTemplateCode} /> {getWorkersForOperation()}
            </OperationContentText>
          </Row>
        );
      })}
      <Box marginTop="20px">
        <OperationText>
          <Template code="Continue with these changes?" />
        </OperationText>
      </Box>
    </Column>
  );
};

const OperationText = styled(FontOpenSans)`
  font-size: 16px;
  font-weight: 700;
`;

const OperationContentText = styled(FontOpenSans)`
  font-size: 16px;
  weight: 400;
`;
