/* eslint-disable react/jsx-max-depth */
/* eslint-disable react/prop-types */
import { v4 as uuidV4 } from 'uuid';
import React, { useEffect } from 'react';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { FieldValues, FormProvider, SubmitErrorHandler, useForm } from 'react-hook-form';
import type { DefinitionVersion } from 'hrm-form-definitions';
import { isEqual } from 'lodash';
import { bindActionCreators } from 'redux';

import {
  BottomButtonBar,
  BottomButtonBarHeight,
  Box,
  ColumnarBlock,
  Container,
  StyledNextStepButton,
  TwoColumnLayout,
} from '../../styles/HrmStyles';
import { CaseActionFormContainer, CaseActionLayout } from '../../styles/case';
import ActionHeader from './ActionHeader';
import { configurationBase, connectedCaseBase, namespace, RootState } from '../../states';
import * as CaseActions from '../../states/case/actions';
import { CaseState } from '../../states/case/reducer';
import { transformValues } from '../../services/ContactService';
import { getConfig } from '../../HrmFormPlugin';
import { updateCase } from '../../services/CaseService';
import {
  createFormFromDefinition,
  createStateItem,
  CustomHandlers,
  disperseInputs,
  splitAt,
  splitInHalf,
} from '../common/forms/formGenerators';
import type { CaseInfo, CaseItemEntry, CustomITask, StandaloneITask } from '../../types/types';
import {
  AddCaseSectionRoute,
  AppRoutes,
  CaseItemAction,
  EditCaseSectionRoute,
  isEditCaseSectionRoute,
} from '../../states/routing/types';
import useFocus from '../../utils/useFocus';
import { recordingErrorHandler } from '../../fullStory';
import { caseItemHistory } from '../../states/case/types';
import CloseCaseDialog from './CloseCaseDialog';
import { CaseSectionApi } from '../../states/case/sections/api';
import { lookupApi } from '../../states/case/sections/lookupApi';
import { copyCaseSectionItem } from '../../states/case/sections/update';
import { changeRoute } from '../../states/routing/actions';

export type AddEditCaseItemProps = {
  task: CustomITask | StandaloneITask;
  counselor: string;
  definitionVersion: DefinitionVersion;
  routing: AddCaseSectionRoute | EditCaseSectionRoute;
  exitRoute: AppRoutes;
  customFormHandlers?: CustomHandlers;
  reactHookFormOptions?: Partial<{ shouldUnregister: boolean }>;
  sectionApi: CaseSectionApi<unknown>;
};
// eslint-disable-next-line no-use-before-define
type Props = AddEditCaseItemProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const AddEditCaseItem: React.FC<Props> = ({
  definitionVersion,
  task,
  counselor,
  counselorsHash,
  exitRoute,
  connectedCase,
  routing,
  updateCaseSectionWorkingCopy,
  initialiseCaseSectionWorkingCopy,
  closeActions,
  setConnectedCase,
  customFormHandlers,
  reactHookFormOptions,
  sectionApi,
  workingCopy,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const firstElementRef = useFocus();
  const { id } = isEditCaseSectionRoute(routing) ? routing : { id: undefined };

  useEffect(() => {
    if (!workingCopy) {
      initialiseCaseSectionWorkingCopy(task.taskSid, sectionApi, id);
    }
  }, [id, initialiseCaseSectionWorkingCopy, sectionApi, task.taskSid, workingCopy]);

  const formDefinition = sectionApi
    .getSectionFormDefinition(definitionVersion)
    // If more 'when adding only' form item types are implemented, we should create a specific property, but there is only one so just check the type for now
    .filter(fd => !id || fd.type !== 'copy-to');
  const layout = sectionApi.getSectionLayoutDefinition(definitionVersion);

  // Grab initial values in first render only. If getTemporaryFormContent(temporaryCaseInfo), cherrypick the values using formDefinition, if not build the object with getInitialValue
  const initialForm = React.useMemo(() => {
    if (id && connectedCase) {
      const { form } = sectionApi.toForm(sectionApi.getSectionItemById(connectedCase.info, id));
      return formDefinition.reduce(
        (accum, curr) => ({
          ...accum,
          [curr.name]: form[curr.name],
        }),
        {},
      );
    }
    return formDefinition.reduce(createStateItem, {});
  }, [connectedCase, formDefinition, id, sectionApi]);

  const methods = useForm(reactHookFormOptions);
  const [openDialog, setOpenDialog] = React.useState(false);

  const { getValues } = methods;

  const [l, r] = React.useMemo(() => {
    const updateCallBack = () => {
      const form = getValues();
      console.log('Updated case form', form);
      updateCaseSectionWorkingCopy(task.taskSid, sectionApi, { ...workingCopy, form }, id);
    };

    const generatedForm = createFormFromDefinition(formDefinition)([])(initialForm, firstElementRef)(
      updateCallBack,
      customFormHandlers,
    );

    if (layout.splitFormAt) return splitAt(layout.splitFormAt)(disperseInputs(7)(generatedForm));

    return splitInHalf(disperseInputs(7)(generatedForm));
  }, [
    formDefinition,
    initialForm,
    firstElementRef,
    customFormHandlers,
    layout.splitFormAt,
    getValues,
    updateCaseSectionWorkingCopy,
    task.taskSid,
    sectionApi,
    workingCopy,
    id,
  ]);

  if (!workingCopy) {
    return null;
  }

  const save = async () => {
    const { info, id } = connectedCase;
    const rawForm = workingCopy.form;
    const form = transformValues(formDefinition)(rawForm);
    const now = new Date().toISOString();
    const { workerSid } = getConfig();
    let newInfo: CaseInfo;
    if (id) {
      newInfo = sectionApi.upsertCaseSectionItemFromForm(info, {
        ...workingCopy,
        form,
        updatedAt: now,
        updatedBy: workerSid,
      });
    } else {
      const newItem: CaseItemEntry = {
        ...workingCopy,
        form,
        createdAt: now,
        twilioWorkerId: workerSid,
        id: uuidV4(),
      };
      newInfo = sectionApi.upsertCaseSectionItemFromForm(info, newItem);
      formDefinition.forEach(fd => {
        // A preceding 'filter' call looks nicer but TS type narrowing isn't smart enough to work with that.
        if (fd.type === 'copy-to' && rawForm[fd.name]) {
          newInfo = copyCaseSectionItem({
            definition: definitionVersion,
            original: newInfo,
            fromApi: sectionApi,
            toApi: lookupApi(fd.target),
          });
        }
      });
    }
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid);
  };

  function close() {
    closeActions(exitRoute);
  }

  async function saveAndStay() {
    await save();
    closeActions({ ...routing, action: CaseItemAction.Add });
  }

  async function saveAndLeave() {
    await save();
    closeActions(exitRoute);
  }

  const { strings } = getConfig();
  const onError: SubmitErrorHandler<FieldValues> = recordingErrorHandler(
    routing.action === CaseItemAction.Edit ? `Case: Edit ${sectionApi.label}` : `Case: Add ${sectionApi.label}`,
    () => {
      window.alert(strings['Error-Form']);
      if (openDialog) setOpenDialog(false);
    },
  );

  const { added, addingCounsellorName, updated, updatingCounsellorName } = id
    ? caseItemHistory(workingCopy, counselorsHash)
    : { added: new Date(), addingCounsellorName: counselor, updated: undefined, updatingCounsellorName: undefined };

  const checkForEdits = () => {
    if (isEqual(workingCopy?.form, initialForm)) {
      close();
    } else setOpenDialog(true);
  };
  return (
    <FormProvider {...methods}>
      <CaseActionLayout>
        <CaseActionFormContainer>
          <ActionHeader
            titleTemplate={
              routing.action === CaseItemAction.Edit ? `Case-Edit${sectionApi.label}` : `Case-Add${sectionApi.label}`
            }
            onClickClose={checkForEdits}
            addingCounsellor={addingCounsellorName}
            added={added}
            updatingCounsellor={updatingCounsellorName}
            updated={updated}
          />
          <Container>
            <Box paddingBottom={`${BottomButtonBarHeight}px`}>
              <TwoColumnLayout>
                <ColumnarBlock>{l}</ColumnarBlock>
                <ColumnarBlock>{r}</ColumnarBlock>
              </TwoColumnLayout>
            </Box>
          </Container>{' '}
        </CaseActionFormContainer>
        <div style={{ width: '100%', height: 5, backgroundColor: '#ffffff' }} />
        <BottomButtonBar>
          <Box marginRight="15px">
            <StyledNextStepButton data-testid="Case-CloseButton" secondary roundCorners onClick={checkForEdits}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
            <CloseCaseDialog
              data-testid="CloseCaseDialog"
              openDialog={openDialog}
              setDialog={() => setOpenDialog(false)}
              handleDontSaveClose={close}
              handleSaveUpdate={methods.handleSubmit(saveAndLeave, onError)}
            />
          </Box>
          {routing.action === CaseItemAction.Add && (
            <Box marginRight="15px">
              <StyledNextStepButton
                data-testid="Case-AddEditItemScreen-SaveAndAddAnotherItem"
                secondary
                roundCorners
                onClick={methods.handleSubmit(saveAndStay, onError)}
              >
                <Template code={`BottomBar-SaveAndAddAnother${sectionApi.label}`} />
              </StyledNextStepButton>
            </Box>
          )}
          <StyledNextStepButton
            data-testid="Case-AddEditItemScreen-SaveItem"
            roundCorners
            onClick={methods.handleSubmit(saveAndLeave, onError)}
          >
            <Template code={`BottomBar-Save${sectionApi.label}`} />
          </StyledNextStepButton>
        </BottomButtonBar>
      </CaseActionLayout>
    </FormProvider>
  );
};

AddEditCaseItem.displayName = 'AddEditCaseItem';

const mapStateToProps = (state: RootState, { task, routing, sectionApi }: AddEditCaseItemProps) => {
  const id = isEditCaseSectionRoute(routing) ? routing.id : undefined;
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
  const { connectedCase, caseWorkingCopy } = caseState.tasks[task.taskSid];
  const workingCopy = sectionApi.getWorkingCopy(caseWorkingCopy, id);

  return { connectedCase, counselorsHash, workingCopy };
};

const mapDispatchToProps = (dispatch, props: AddEditCaseItemProps) => {
  const { sectionApi, routing, task } = props;
  const id = isEditCaseSectionRoute(routing) ? routing.id : undefined;
  return {
    setConnectedCase: bindActionCreators(CaseActions.setConnectedCase, dispatch),
    updateCaseSectionWorkingCopy: bindActionCreators(CaseActions.updateCaseSectionWorkingCopy, dispatch),
    initialiseCaseSectionWorkingCopy: bindActionCreators(CaseActions.initialiseCaseSectionWorkingCopy, dispatch),
    closeActions: route => {
      dispatch(CaseActions.removeCaseSectionWorkingCopy(task.taskSid, sectionApi, id));
      dispatch(changeRoute(route, task.taskSid));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddEditCaseItem);
