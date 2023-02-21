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
) => <div key={inputId}>{customContactFormItemContent(formItemDefinition, context)}</div>;

const customContactFormItemContent = (
  formItemDefinition: FormItemDefinition & { type: FormInputType.CustomContactComponent },
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
        <>Custom component &lsqou;{formItemDefinition.component}&rsqou; not defined, did you forget to register it?</>
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
      <>
        Error rendering custom contact form component &lsquo;{formItemDefinition.component}&rsquo;: either a taskSid or
        a contactId must be provided in the context
      </>
    );
  } catch (err) {
    return (
      <>
        Error rendering custom contact form component &lsquo;{formItemDefinition.component}&rsquo;: {err.message}
      </>
    );
  }
};
