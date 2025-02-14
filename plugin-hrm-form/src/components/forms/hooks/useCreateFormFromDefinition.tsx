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

import { FormDefinition, FormItemDefinition } from 'hrm-form-definitions';
import { get } from 'lodash';

import { createInput, CreateInputParams } from '../inputGenerator';
import useFocus from '../../../utils/useFocus';
import { getInitialValue } from '../../common/forms/formGenerators';

type UseFormFromDefinition = {
  definition: FormDefinition;
  parentsPath: CreateInputParams['parentsPath'];
  updateCallback: () => void;
  initialValues: Record<string, CreateInputParams['initialValue']>;
  shouldFocusFirstElement?: boolean;
  customHandlers?: CreateInputParams['customHandlers'];
  isItemEnabled?: (item: FormItemDefinition) => boolean;
  context?: {
    contactId?: string;
    caseId?: string;
  };
};

const alwaysEnabled = () => true;

const useCreateFormFromDefinition = ({
  definition,
  parentsPath,
  updateCallback,
  initialValues,
  shouldFocusFirstElement,
  customHandlers,
  isItemEnabled = alwaysEnabled,
  context = {},
}: UseFormFromDefinition) => {
  const firstElementRef = useFocus(shouldFocusFirstElement);
  if (!initialValues) return [];

  return definition.map((e: FormItemDefinition, index: number) => {
    const elementRef = index === 0 ? firstElementRef : null;
    const maybeValue = get(initialValues, e.name);
    const initialValue = maybeValue === undefined ? getInitialValue(e) : maybeValue;

    return createInput({
      formItemDefinition: e,
      parentsPath,
      initialValue,
      isItemEnabled, // bind this item definition to the isItemEnabled function
      updateCallback,
      htmlElRef: elementRef,
      customHandlers,
      context,
    });
  });
};

export default useCreateFormFromDefinition;
