import { CallerFormInformation } from './CallerForm';
import { createBlankForm } from '../../../states/ContactFormStateFactory';

export * from './CallerForm';
export { default as CallerForm } from './CallerForm';

// TODO: fix this type error (createBlankForm must be typed or maybe create a separate function)
export const newCallerFormInformation: CallerFormInformation = createBlankForm().callerInformation;
