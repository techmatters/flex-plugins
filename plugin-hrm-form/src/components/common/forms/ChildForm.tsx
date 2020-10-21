/* eslint-disable react/prop-types */
import React from 'react';

import { createFormFromDefinition } from './formGenerators';
import ChildFormDefinition from '../../../formDefinitions/childForm.json';
import type { FormDefinition } from './types';
import { Container } from '../../../styles/HrmStyles';

type OwnProps = { childInformation: any; defaultEventHandlers: any };

// eslint-disable-next-line no-use-before-define
type Props = OwnProps;

const ChildForm: React.FC<Props> = ({ childInformation, defaultEventHandlers }) => {
  const childFormDefinition = React.useMemo(() => {
    console.log('>>> useMemo called');

    const handlers = (parents: string[], name: string) => defaultEventHandlers(['childInformation', ...parents], name);

    // TODO: fix this typecasting
    return createFormFromDefinition(handlers)(childInformation)(ChildFormDefinition as FormDefinition);
  }, [childInformation, defaultEventHandlers]);

  console.log('>>> re-render');

  return <Container>{childFormDefinition}</Container>;
};

ChildForm.displayName = 'ChildForm';

export default ChildForm;
