import { connect, ConnectedProps } from 'react-redux';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { DefinitionVersion, FormDefinition, LayoutDefinition } from 'hrm-form-definitions';
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';

import { InformationObject, SearchContact } from '../../types/types';
import { configurationBase, contactFormsBase, namespace, RootState } from '../../states';
import TabbedFormTab from '../tabbedForms/TabbedFormTab';
import { transformContactFormValues, unNestInformationObject, updateContactInHrm } from '../../services/ContactService';
import { TaskEntry } from '../../states/contacts/reducer';
import { Box, StyledNextStepButton } from '../../styles/HrmStyles';
import { recordingErrorHandler } from '../../fullStory';
import { getConfig } from '../../HrmFormPlugin';
import { ContactDetailsRoute, DetailsContext, navigateContactDetails } from '../../states/contacts/contactDetails';
import {
  ContactDetailsSectionForm,
  ContactFormValues,
  isIssueCategorizationSectionForm,
  IssueCategorizationSectionForm,
} from './contactDetailsSectionForms';
import IssueCategorizationTab from '../tabbedForms/IssueCategorizationTab';

type OwnProps = {
  context: DetailsContext;
  contactId: string;
  contactDetailsSectionForm: ContactDetailsSectionForm | IssueCategorizationSectionForm;
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
  contactDetailsSectionForm,
  children,
}) => {
  const methods = useForm({
    shouldFocusError: false,
    mode: 'onChange',
  });

  const version = contact?.details.definitionVersion;

  const definitionVersion = definitionVersions[version];

  const [isSubmitting, setSubmitting] = useState(false);

  const navigate = (route: ContactDetailsRoute) => navigateForContext(context, route);

  if (!contact || !definitionVersion) return null;

  const onSubmitValidForm = async () => {
    setSubmitting(true);
    if (isIssueCategorizationSectionForm(contactDetailsSectionForm)) {
      const payload = contactDetailsSectionForm.formToPayload(
        definitionVersion,
        methods.getValues() as { categories: string[] },
      );
      await updateContactInHrm(contactId, payload);
    } else {
      const payload = contactDetailsSectionForm.formToPayload(
        definitionVersion,
        methods.getValues() as ContactFormValues,
      );
      await updateContactInHrm(contactId, payload);
    }
    navigate(ContactDetailsRoute.HOME);
  };

  const onError = recordingErrorHandler('Edit Contact Form', () => {
    const { strings } = getConfig();
    window.alert(strings['Error-Form']);
  });

  return (
    <FormProvider {...methods}>
      {children}
      <Box marginRight="15px">
        <StyledNextStepButton
          roundCorners={true}
          onClick={() => navigate(ContactDetailsRoute.HOME)}
          disabled={isSubmitting}
          secondary
          data-fs-id="BottomBar-Cancel"
        >
          {isSubmitting ? <CircularProgress size={12} /> : <Template code="BottomBar-Cancel" />}
        </StyledNextStepButton>
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
    </FormProvider>
  );
};

const mapDispatchToProps = {
  navigateForContext: navigateContactDetails,
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  contact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.contact,
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(EditContactSection);

export default connected;
