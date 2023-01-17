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
};

const allwaysEnabled = () => true;

const useCreateFormFromDefinition = ({
  definition,
  parentsPath,
  updateCallback,
  initialValues,
  shouldFocusFirstElement,
  customHandlers,
  isItemEnabled = allwaysEnabled,
}: UseFormFromDefinition) => {
  const firstElementRef = useFocus(shouldFocusFirstElement);
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
    });
  });
};

export default useCreateFormFromDefinition;
