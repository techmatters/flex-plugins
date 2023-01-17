import { connect, ConnectedProps } from 'react-redux';
import React, { Dispatch, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';
import _ from 'lodash';
import { Close } from '@material-ui/icons';

import { configurationBase, contactFormsBase, namespace, RootState } from '../../states';
import { updateContactInHrm } from '../../services/ContactService';
import { Box, StyledNextStepButton, BottomButtonBar, Row, HiddenText, HeaderCloseButton } from '../../styles/HrmStyles';
import { CaseActionTitle, EditContactContainer } from '../../styles/case';
import { recordBackendError, recordingErrorHandler } from '../../fullStory';
import { getConfig } from '../../HrmFormPlugin';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { ContactDetailsSectionFormApi, IssueCategorizationSectionFormApi } from './contactDetailsSectionFormApi';
import { clearDraft, refreshRawContact } from '../../states/contacts/existingContacts';
import CloseCaseDialog from '../case/CloseCaseDialog';
import * as t from '../../states/contacts/actions';
import type { TaskEntry } from '../../states/contacts/reducer';

type OwnProps = {
  context: DetailsContext;
  contactId: string;
  contactDetailsSectionForm: ContactDetailsSectionFormApi | IssueCategorizationSectionFormApi;
  children: React.ReactNode;
  tabPath: keyof TaskEntry;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const EditContactSection: React.FC<Props> = ({
  savedContact,
  contactId,
  definitionVersions,
  refreshContact,
  contactDetailsSectionForm,
  setEditContactPageOpen,
  setEditContactPageClosed,
  tabPath,
  children,
  clearContactDraft,
}) => {
  const methods = useForm({
    shouldFocusError: false,
    mode: 'onSubmit',
  });
  const { strings } = getConfig();

  const version = savedContact?.details.definitionVersion;

  const definitionVersion = definitionVersions[version];

  const [isSubmitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState({});

  useEffect(() => {
    /*
     * we need this to run only once, hence no need
     * of adding any dependency inside the array
     */
    setInitialFormValues(methods.getValues());
    setEditContactPageOpen();
    return () => {
      setEditContactPageClosed();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!savedContact || !definitionVersion) return null;

  const onSubmitValidForm = async () => {
    setSubmitting(true);
    const payload = contactDetailsSectionForm.formToPayload(
      definitionVersion,
      methods.getValues() as { categories: string[] },
      savedContact.overview.helpline,
    );
    try {
      const updatedContact = await updateContactInHrm(contactId, payload);
      refreshContact(updatedContact);
    } catch (error) {
      setSubmitting(false);
      recordBackendError('Open New Case', error);
      window.alert(strings['Error-Backend']);
    }
  };

  const onError = recordingErrorHandler('Edit Contact Form', () => {
    const { strings } = getConfig();
    window.alert(strings['Error-Form']);
  });

  const checkForEdits = () => {
    if (_.isEqual(methods.getValues(), initialFormValues)) {
      clearContactDraft();
    } else {
      setOpenDialog(true);
    }
  };

  // With tabPath as an input, this function returns the localized string for section's title
  const editContactSectionTitle = (tabPath: keyof TaskEntry): string => {
    if (tabPath === 'callerInformation') {
      return strings['Contact-EditCaller'];
    } else if (tabPath === 'childInformation') {
      return strings['Contact-EditChild'];
    } else if (tabPath === 'categories') {
      return strings['Contact-EditCategories'];
    } else if (tabPath === 'caseInformation') {
      return strings['Contact-EditSummary'];
    }
    return '';
  };

  const onSubmitForm = methods.handleSubmit(onSubmitValidForm, onError);

  return (
    <EditContactContainer>
      <FormProvider {...methods}>
        <Row style={{ margin: '30px' }}>
          <CaseActionTitle>
            <Template code={editContactSectionTitle(tabPath)} />
          </CaseActionTitle>
          <HeaderCloseButton
            onClick={checkForEdits}
            data-testid="Case-CloseCross"
            style={{ marginRight: '15px', opacity: '.75' }}
          >
            <HiddenText>
              <Template code="Case-CloseButton" />
            </HiddenText>
            <Close />
          </HeaderCloseButton>
        </Row>
        {children}
        <BottomButtonBar>
          <Box marginRight="15px">
            <StyledNextStepButton
              roundCorners={true}
              onClick={checkForEdits}
              disabled={isSubmitting}
              secondary
              data-fs-id="BottomBar-Cancel"
            >
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
            <CloseCaseDialog
              data-testid="CloseCaseDialog"
              openDialog={openDialog}
              setDialog={() => setOpenDialog(false)}
              handleDontSaveClose={() => {
                clearContactDraft();
              }}
              handleSaveUpdate={methods.handleSubmit(onSubmitValidForm, onError)}
            />
          </Box>
          <Box marginRight="15px">
            <StyledNextStepButton
              roundCorners={true}
              onClick={onSubmitForm}
              disabled={isSubmitting}
              data-fs-id="Contact-SaveContact-Button"
              data-testid="EditContact-SaveContact-Button"
            >
              <span style={{ visibility: isSubmitting ? 'hidden' : 'inherit' }}>
                {/* eslint-disable-next-line react/jsx-max-depth */}
                <Template code="BottomBar-SaveContact" />
              </span>
              {isSubmitting ? <CircularProgress size={12} style={{ position: 'absolute' }} /> : null}
            </StyledNextStepButton>
          </Box>
        </BottomButtonBar>
      </FormProvider>
    </EditContactContainer>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<{ type: string } & Record<string, any>>, { contactId }: OwnProps) => ({
  refreshContact: contact => dispatch(refreshRawContact(contact)),
  setEditContactPageOpen: () => dispatch(t.setEditContactPageOpen()),
  setEditContactPageClosed: () => dispatch(t.setEditContactPageClosed()),
  clearContactDraft: () => {
    dispatch(clearDraft(contactId));
  },
});

const mapStateToProps = (state: RootState, { contactId }: OwnProps) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  savedContact: state[namespace][contactFormsBase].existingContacts[contactId]?.savedContact,
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(EditContactSection);

export default connected;
