import React from 'react';
import { get } from 'lodash';

import FieldText from '../../FieldText';
import { FormRow } from '../../../styles/HrmStyles';
import { FormItemDefinition, FormDefinition } from './types';

// eslint-disable-next-line react/display-name
const getInputType = defaultEventHandlers => field => (def: FormItemDefinition) => {
  switch (def.type) {
    case 'input':
      return (
        <FieldText
          id={[...def.parents, def.name].join('')}
          label={def.label}
          field={field}
          {...defaultEventHandlers(def.parents, def.name)}
        />
      );
    default:
      return null;
  }
};

export const createFormFromDefinition = defaultEventHandlers => form => (definition: FormDefinition): JSX.Element[] => {
  console.log('>>>> createFormFromDefinition called');

  if (!definition.length) return [];

  if (definition.length === 1)
    return [
      <FormRow key={`${definition[0].name}-form-row`}>
        {getInputType(defaultEventHandlers)(get(form, [...definition[0].parents, definition[0].name]))(definition[0])}
        <div />
      </FormRow>,
    ];

  const [x, y, ...rest] = definition;
  const row = (
    <FormRow key={`${x.name}-${y.name}-form-row`}>
      {getInputType(defaultEventHandlers)(get(form, [...x.parents, x.name]))(x)}
      {getInputType(defaultEventHandlers)(get(form, [...y.parents, y.name]))(y)}
    </FormRow>
  );
  return [row, ...createFormFromDefinition(defaultEventHandlers)(form)(rest)];
};
