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
import { FormInputType, FormItemDefinition } from '@tech-matters/hrm-form-definitions';

import customContactComponentRegistry from '../customContactComponentRegistry';

type ContactComponentContext = {
  contactId?: string;
};

export const generateCustomContactFormItem = (
  formItemDefinition: FormItemDefinition & { type: FormInputType.CustomContactComponent },
  inputId: string,
  context: ContactComponentContext = {},
) => <div key={inputId}>{customContactFormItemContent(formItemDefinition, inputId, context)}</div>;

const customContactFormItemContent = (
  formItemDefinition: FormItemDefinition & { type: FormInputType.CustomContactComponent },
  inputId: string,
  {
    contactId,
  }: {
    contactId?: string;
  } = {},
) => {
  try {
    const componentGenerator = customContactComponentRegistry.lookup(formItemDefinition.component);
    if (!componentGenerator) {
      return (
        <div data-testid={`unregistered-error-${inputId}`}>
          Custom component &lsqou;{formItemDefinition.component}&rsqou; not defined, did you forget to register it?
        </div>
      );
    }
    if (contactId) {
      return componentGenerator({
        contactId,
        props: formItemDefinition.props,
        name: formItemDefinition.name,
        label: formItemDefinition.label,
      });
    }
    return (
      <div data-testid={`context-error-${inputId}`}>
        Error rendering custom contact form component &lsquo;{formItemDefinition.component}&rsquo;: a contactId must be
        provided in the context
      </div>
    );
  } catch (err) {
    return (
      <div data-testid={`unhandled-error-${inputId}`}>
        Error rendering custom contact form component &lsquo;{formItemDefinition.component}&rsquo;: {err.message}
      </div>
    );
  }
};
