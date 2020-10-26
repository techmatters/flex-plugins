import React from 'react';
import { get } from 'lodash';
import { Template } from '@twilio/flex-ui';

import FieldText from '../../FieldText';
import FieldSelect from '../../FieldSelect';
import { FormRow } from '../../../styles/HrmStyles';
import { FormItemDefinition, FormDefinition } from './types';
import { getParents } from './helpers';

// eslint-disable-next-line react/display-name
const getInputType = defaultEventHandlers => field => (def: FormItemDefinition) => {
  const label = <Template code={def.label} />;

  const parents = getParents(def);
  switch (def.type) {
    case 'input':
      return (
        <FieldText
          id={[...parents, def.name].join('')}
          label={label}
          field={field}
          {...defaultEventHandlers(parents, def.name)}
        />
      );
    case 'select':
      return (
        <FieldSelect
          id={[...parents, def.name].join('')}
          name={def.name}
          label={label}
          options={def.options}
          field={field}
          {...defaultEventHandlers(parents, def.name)}
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
        {getInputType(defaultEventHandlers)(get(form, [...getParents(definition[0]), definition[0].name]))(
          definition[0],
        )}
        <div />
      </FormRow>,
    ];

  const [x, y, ...rest] = definition;
  const row = (
    <FormRow key={`${x.name}-${y.name}-form-row`}>
      {getInputType(defaultEventHandlers)(get(form, [...getParents(x), x.name]))(x)}
      {getInputType(defaultEventHandlers)(get(form, [...getParents(y), y.name]))(y)}
    </FormRow>
  );
  return [row, ...createFormFromDefinition(defaultEventHandlers)(form)(rest)];
};
