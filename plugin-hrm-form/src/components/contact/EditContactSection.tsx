import { connect, ConnectedProps } from 'react-redux';
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { DefinitionVersion, FormDefinition } from 'hrm-form-definitions';

import { InformationObject, SearchContact } from '../../types/types';
import { configurationBase, contactFormsBase, namespace, RootState } from '../../states';
import TabbedFormTab from '../tabbedForms/TabbedFormTab';
import { unNestInformationObject } from '../../services/ContactService';
import { TaskEntry } from '../../states/contacts/reducer';

type OwnProps = {
  contactId: string;
  getFormDefinition: (def: DefinitionVersion) => FormDefinition;
  getFormData: (contact: SearchContact) => InformationObject;
  formPath: keyof TaskEntry;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const EditContactSection: React.FC<Props> = ({
  contact,
  contactId,
  definitionVersions,
  getFormDefinition,
  getFormData,
  formPath,
}) => {
  const methods = useForm({
    shouldFocusError: false,
    mode: 'onChange',
  });

  const version = contact?.details.definitionVersion;

  const definitionVersion = definitionVersions[version];

  if (!contact || !definitionVersion) return null;

  return (
    <FormProvider {...methods}>
      <TabbedFormTab
        entityIdentifier={contactId}
        tabPath={formPath}
        definition={getFormDefinition(definitionVersion)}
        layoutDefinition={definitionVersion.layoutVersion.contact.callerInformation}
        initialValues={unNestInformationObject(
          definitionVersion.tabbedForms.CallerInformationTab,
          getFormData(contact),
        )}
        display={true}
        autoFocus={true}
      />
    </FormProvider>
  );
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  contact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.contact,
});

const connector = connect(mapStateToProps);
const connected = connector(EditContactSection);

export default connected;
