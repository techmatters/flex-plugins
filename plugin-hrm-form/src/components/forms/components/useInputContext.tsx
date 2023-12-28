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
import { Template } from '@twilio/flex-ui';
import { get } from 'lodash';
import { useFormContext } from 'react-hook-form';

import { FormInputBaseProps } from './types';

type UseInputContextParams = {
  inputId: string;
  label: string;
  htmlElRef: FormInputBaseProps['htmlElRef'];
  registerOptions: FormInputBaseProps['registerOptions'];
};

const useInputContext = ({ inputId, label, htmlElRef, registerOptions }: UseInputContextParams) => {
  const methods = useFormContext();

  const labelTextComponent = React.useMemo(
    () => (label ? <Template code={`${label}`} className=".fullstory-unmask" /> : null),
    [label],
  );

  const error = get(methods.errors, inputId);
  const errorId = `${inputId}-error`;
  const errorTextComponent = React.useMemo(() => (error ? <Template id={errorId} code={error.message} /> : null), [
    error,
    errorId,
  ]);

  const refFunction = React.useCallback(
    (isFocusTarget: boolean) => ref => {
      if (htmlElRef && ref && isFocusTarget) {
        htmlElRef.current = ref;
      }
      methods.register(registerOptions)(ref);
    },
    [htmlElRef, methods, registerOptions],
  );

  return {
    ...methods,
    labelTextComponent,
    error,
    errorId,
    errorTextComponent,
    refFunction,
  };
};

export default useInputContext;
