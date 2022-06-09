import { connect, ConnectedProps } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';
import _ from 'lodash';

import { configurationBase, contactFormsBase, namespace, RootState } from '../../states';
import { updateContactInHrm } from '../../services/ContactService';
import { Flex, Box, StyledNextStepButton, BottomButtonBar } from '../../styles/HrmStyles';
import { recordBackendError, recordingErrorHandler } from '../../fullStory';
import { getConfig } from '../../HrmFormPlugin';
import { ContactDetailsRoute, DetailsContext, navigateContactDetails } from '../../states/contacts/contactDetails';
import { ContactDetailsSectionFormApi, IssueCategorizationSectionFormApi } from './contactDetailsSectionFormApi';
import { refreshRawContact } from '../../states/contacts/existingContacts';
import CloseCaseDialog from '../case/CloseCaseDialog';

type OwnProps = {
  context: DetailsContext;
  contactId: string;
  contactDetailsSectionForm: ContactDetailsSectionFormApi | IssueCategorizationSectionFormApi;
  children?: React.ReactNode;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const EditContactSection: React.FC<Props> = ({
  context,
  contact,
  contactId,
  definitionVersions,
  navigateForContext,
  refreshContact,
  contactDetailsSectionForm,
  children,
}) => {
  const methods = useForm({
    shouldFocusError: false,
    mode: 'onSubmit',
  });
  const { strings } = getConfig();

  const version = contact?.details.definitionVersion;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (route: ContactDetailsRoute) => navigateForContext(context, route);

  if (!contact || !definitionVersion) return null;

  const onSubmitValidForm = async () => {
    setSubmitting(true);
    const payload = contactDetailsSectionForm.formToPayload(
      definitionVersion,
      methods.getValues() as { categories: string[] },
      contact.overview.helpline,
    );
    try {
      const updatedContact = await updateContactInHrm(contactId, payload);
      refreshContact(updatedContact);
      navigate(ContactDetailsRoute.HOME);
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
      navigate(ContactDetailsRoute.HOME);
    } else {
      setOpenDialog(true);
    }
  };

  return (
    <FormProvider {...methods}>
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
            handleDontSaveClose={() => navigate(ContactDetailsRoute.HOME)}
            handleSaveUpdate={methods.handleSubmit(onSubmitValidForm, onError)}
          />
        </Box>
        <Box marginRight="15px">
          <StyledNextStepButton
            roundCorners={true}
            onClick={methods.handleSubmit(onSubmitValidForm, onError)}
            disabled={isSubmitting}
            data-fs-id="Contact-SaveContact-Button"
          >
            {isSubmitting ? <CircularProgress size={12} /> : <Template code="BottomBar-SaveContact" />}
          </StyledNextStepButton>
        </Box>
      </BottomButtonBar>
    </FormProvider>
  );
};

const mapDispatchToProps = {
  navigateForContext: navigateContactDetails,
  refreshContact: refreshRawContact,
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  contact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.contact,
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(EditContactSection);

export default connected;
