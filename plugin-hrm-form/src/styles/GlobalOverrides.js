import { injectGlobal } from 'react-emotion';

// Task list header padding (matches the ALL TASKS button padding)
export const TLHPaddingLeft = '12px';

// eslint-disable-next-line no-unused-expressions
injectGlobal`
  div.Twilio-ModalPopupWithEntryControl {
    padding-top: 7px;
    padding-bottom: 7px;
    border-width: 0px 0px 1px 0px;
  }
`;
