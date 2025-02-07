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

/* eslint-disable react/prop-types */
import React, { Dispatch } from 'react';
import { connect, ConnectedProps, useSelector } from 'react-redux';
import { FieldError, useFormContext } from 'react-hook-form';
import { format, isFuture, parse } from 'date-fns';
import { get } from 'lodash';
import type { DefinitionVersion } from 'hrm-form-definitions';

import { disperseInputs } from '../common/forms/formGenerators';
import { useCreateFormFromDefinition } from '../forms';
import { Container, ColumnarBlock, TwoColumnLayout, ColumnarContent } from '../../styles';
import { RootState } from '../../states';
import { selectWorkerSid } from '../../states/selectors/flexSelectors';
import { createContactlessTaskTabDefinition } from './ContactlessTaskTabDefinition';
import type { ContactRawJson, OfflineContactTask } from '../../types/types';
import { updateDraft } from '../../states/contacts/existingContacts';
import { configurationBase, namespace } from '../../states/storeNamespaces';
import { getUnsavedContact } from '../../states/contacts/getUnsavedContact';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';

type OwnProps = {
  task: OfflineContactTask;
  display: boolean;
  helplineInformation: DefinitionVersion['helplineInformation'];
  definition: DefinitionVersion['tabbedForms']['ContactlessTaskTab'];
  initialValues: ContactRawJson['contactlessTask'];
  autoFocus: boolean;
};

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const { savedContact, draftContact } = selectContactByTaskSid(state, task.taskSid) ?? {};
  return {
    counselorsList: state[namespace][configurationBase].counselors.list,
    unsavedContact: getUnsavedContact(savedContact, draftContact),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
  return {
    updateContactlessTaskDraft: (
      contactId: string,
      timeOfContact: string,
      contactlessTask: ContactRawJson['contactlessTask'],
      helpline: string,
    ) => dispatch(updateDraft(contactId, { rawJson: { contactlessTask }, helpline, timeOfContact })),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const ContactlessTaskTab: React.FC<Props> = ({
  display,
  helplineInformation,
  definition,
  counselorsList,
  autoFocus,
  unsavedContact,
  updateContactlessTaskDraft,
}) => {
  const { getValues, register, setError, setValue, watch, errors } = useFormContext();

  const workerSid = useSelector(selectWorkerSid);

  const formDefinition = React.useMemo(
    () => createContactlessTaskTabDefinition({ counselorsList, helplineInformation, definition }),
    [counselorsList, definition, helplineInformation],
  );

  const {
    timeOfContact,
    helpline,
    rawJson: {
      contactlessTask: { createdOnBehalfOf, channel },
    },
  } = unsavedContact;

  const localTimeOfContact = new Date(timeOfContact);
  const date = format(localTimeOfContact, 'yyyy-MM-dd');
  const time = format(localTimeOfContact, 'HH:mm');

  const form = useCreateFormFromDefinition({
    definition: formDefinition,
    initialValues: {
      date,
      time,
      channel,
      helpline,
      createdOnBehalfOf: createdOnBehalfOf || workerSid, // If no createdOnBehalfOf coming from state, we want the current counselor to be the default
    },
    parentsPath: 'contactlessTask',
    updateCallback: () => {
      const { isFutureAux, helpline, time, date, ...contactlessTaskFields } = getValues().contactlessTask;
      const localTime = new Date(`${date}T${time}`);
      updateContactlessTaskDraft(unsavedContact.id, localTime.toISOString(), contactlessTaskFields, helpline);
    },
    shouldFocusFirstElement: display && autoFocus,
  });

  const contactlessTaskForm = disperseInputs(5)(form);

  // Add invisible field that errors if date + time are future (triggered by validation)
  React.useEffect(() => {
    register('contactlessTask.isFutureAux', {
      validate: () => {
        const { contactlessTask } = getValues();
        const { date, time } = contactlessTask;
        if (date && time) {
          const dateTime = parse(`${date}T${time}`, "yyyy-MM-dd'T'HH:mm", new Date());
          if (isFuture(dateTime)) {
            return 'TimeCantBeGreaterThanNow'; // return non-null to generate an error, using the localized error key
          }
        }
        return null;
      },
    });
  }, [getValues, register, setError]);

  // Replicate error in time if there is error in isFutureAux
  const isFutureError: FieldError = get(errors, 'contactlessTask.isFutureAux');
  React.useEffect(() => {
    if (isFutureError) setError('contactlessTask.time', { message: isFutureError.message, type: 'isFutureAux' });
  }, [isFutureError, setError]);

  const timeFormValue = watch('contactlessTask.time');
  // Set isFutureAux (triggered by time onChange) so it's revalidated (this makes sense after 1st submission attempt)
  React.useEffect(() => {
    setValue('contactlessTask.isFutureAux', timeFormValue, { shouldValidate: true });
  }, [setValue, timeFormValue]);

  return (
    <Container formContainer={true}>
      <TwoColumnLayout>
        <ColumnarBlock>
          <ColumnarContent>{contactlessTaskForm}</ColumnarContent>
        </ColumnarBlock>
        <ColumnarBlock />
      </TwoColumnLayout>
    </Container>
  );
};

ContactlessTaskTab.displayName = 'ContactlessTaskTab';
const connected = connector(ContactlessTaskTab);

export default connected;
