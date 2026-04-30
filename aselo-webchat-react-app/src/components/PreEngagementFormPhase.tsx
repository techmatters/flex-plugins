/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { Box } from '@twilio-paste/core/box';
import { FormEvent, useCallback, useRef, useState } from 'react';
import { Button } from '@twilio-paste/core/button';
import { Spinner } from '@twilio-paste/core/spinner';
import { useDispatch, useSelector } from 'react-redux';
import { Text } from '@twilio-paste/core/text';
import { FormInputType } from 'hrm-form-definitions';

import {
  newUpdateRecaptchaValidityAction,
  submitAndInitChatThunk,
  updatePreEngagementDataFields,
} from '../store/actions/genericActions';
import { AppState } from '../store/definitions';
import { Header } from './Header';
import { NotificationBar } from './NotificationBar';
import { fieldStyles, titleStyles, formStyles } from './styles/PreEngagementFormPhase.styles';
import LocalizedTemplate from '../localization/LocalizedTemplate';
import { generateForm } from './forms/formInputs';
import ReCaptcha from './ReCaptcha';
import { selectPreEngagementData, selectPreEngagementDataValid, selectRecaptchaValid } from '../store/session.reducer';

// eslint-disable-next-line sonarjs/cognitive-complexity
export const PreEngagementFormPhase = () => {
  const preEngagementData = useSelector(selectPreEngagementData);
  const preEngagementDataValid = useSelector(selectPreEngagementDataValid);
  const formRef = useRef<HTMLFormElement>(null);

  const { preEngagementFormDefinition, enableRecaptcha, recaptchaSiteKey, aseloBackendUrl } = useSelector(
    (state: AppState) => state.config,
  );
  const recaptchaValid = useSelector(selectRecaptchaValid);
  const dispatch = useDispatch();

  const [isRecaptchaVerifyPending, setRecaptchaVerifyPending] = useState(false);
  const [wasSubmitAttempted, setSubmitAttempted] = useState(false);
  const [fieldsTouched, setFieldsTouched] = useState(new Set<string>());

  const setPreEngagementDataFromDom = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    // Collect current DOM values for all form fields and sync them to Redux in a
    // single dispatch before validation runs. This ensures fields that have been
    // filled but not yet blurred are still captured.
    const domFieldValues = (preEngagementFormDefinition?.fields ?? []).reduce<
      { name: string; value: string | boolean }[]
    >((accum, field) => {
      const element = form.querySelector<HTMLInputElement | HTMLSelectElement>(`#${field.name}`);
      if (!element) return accum;
      const value = field.type === FormInputType.Checkbox ? (element as HTMLInputElement).checked : element.value;
      return [...accum, { name: field.name, value }];
    }, []);

    if (domFieldValues.length > 0) {
      dispatch(updatePreEngagementDataFields(domFieldValues) as any);
    }
  }, [dispatch, preEngagementFormDefinition?.fields]);

  const getItem = (inputName: string) => preEngagementData[inputName] ?? {};
  const setItemValue = ({ name }: { name: string }) => {
    setFieldsTouched(fieldsTouched.add(name));
    setPreEngagementDataFromDom();
  };
  const handleChange = setItemValue;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPreEngagementDataFromDom();
    setSubmitAttempted(true);
    await dispatch(submitAndInitChatThunk() as any);
  };

  if (!preEngagementFormDefinition) {
    return null;
  }

  const titleText = preEngagementFormDefinition.description ?? 'Hi there!';
  const submitText = preEngagementFormDefinition.submitLabel ?? 'Start chat';
  const recaptchaVerifyUrl = `${aseloBackendUrl}/lambda/recaptchaVerify`;

  return (
    <>
      <Header />
      <NotificationBar />
      <Box as="form" data-test="pre-engagement-chat-form" onSubmit={handleSubmit} {...formStyles} ref={formRef}>
        <Text {...titleStyles} as="h3">
          <LocalizedTemplate code={titleText} />
        </Text>
        <Box {...fieldStyles}>
          {generateForm({
            form: preEngagementFormDefinition.fields,
            handleChange,
            getItem,
            setItemValue,
            showError: name => wasSubmitAttempted || fieldsTouched.has(name),
          })}
        </Box>

        {enableRecaptcha && recaptchaSiteKey && (
          <Box {...fieldStyles}>
            <ReCaptcha
              siteKey={recaptchaSiteKey}
              recaptchaVerifyUrl={recaptchaVerifyUrl}
              onRecaptchaChange={state => {
                setRecaptchaVerifyPending(state === 'pending');
                dispatch(newUpdateRecaptchaValidityAction({ recaptchaValid: state === 'verified' }));
              }}
            />
          </Box>
        )}

        <Button
          variant="primary"
          type="submit"
          disabled={!recaptchaValid || !preEngagementDataValid}
          data-test="pre-engagement-start-chat-button"
        >
          <span style={isRecaptchaVerifyPending ? { visibility: 'hidden' } : {}}>
            <LocalizedTemplate code={submitText} />
          </span>
          {isRecaptchaVerifyPending && (
            <span style={{ position: 'absolute' }}>
              <Spinner decorative={true} />
            </span>
          )}
        </Button>
      </Box>
    </>
  );
};
