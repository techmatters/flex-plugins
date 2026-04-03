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
import { FormItemDefinition } from 'hrm-form-definitions';
import { Template } from '@twilio/flex-ui';

import {
  BACKROUND_COLOR,
  FieldInputDescriptionContainer,
  FieldInputDescriptionExpandableText,
  FieldInputDescriptionText,
  FieldInputDescriptionTitle,
} from './styles';

type Props = {
  definition: FormItemDefinition;
};

export const FormInputDescription: React.FC<Props> = ({ definition }) => {
  if (!Boolean(definition.description)) {
    return null;
  }

  return (
    <FieldInputDescriptionContainer>
      <FieldInputDescriptionTitle>
        <Template code={definition.description.title} />
      </FieldInputDescriptionTitle>
      <FieldInputDescriptionExpandableText
        expandLinkText="ReadMore"
        collapseLinkText="ReadLess"
        collapsedOverrides={{ whiteSpace: 'wrap', linesPreview: 2, backgroundColor: BACKROUND_COLOR }}
      >
        <FieldInputDescriptionText>
          <Template code={definition.description.content} />
        </FieldInputDescriptionText>
      </FieldInputDescriptionExpandableText>
    </FieldInputDescriptionContainer>
  );
};
