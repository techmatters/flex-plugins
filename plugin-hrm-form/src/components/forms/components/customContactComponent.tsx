import React from 'react';
import { FormInputType, FormItemDefinition } from 'hrm-form-definitions';

import customContactComponentRegistry from '../customContactComponentRegistry';

type ContactComponentContext = {
  taskSid?: string;
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
    taskSid,
    contactId,
  }: {
    taskSid?: string;
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
    if (taskSid) {
      return componentGenerator({
        taskSid,
        props: formItemDefinition.props,
        name: formItemDefinition.name,
        label: formItemDefinition.label,
      });
    } else if (contactId) {
      return componentGenerator({
        contactId,
        props: formItemDefinition.props,
        name: formItemDefinition.name,
        label: formItemDefinition.label,
      });
    }
    return (
      <div data-testid={`context-error-${inputId}`}>
        Error rendering custom contact form component &lsquo;{formItemDefinition.component}&rsquo;: either a taskSid or
        a contactId must be provided in the context
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
