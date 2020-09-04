import { injectGlobal } from 'react-emotion';

import { colors } from './HrmTheme';

// Task list header padding (matches the ALL TASKS button padding)
export const TLHPaddingLeft = '12px';

// eslint-disable-next-line no-unused-expressions
injectGlobal`
  div.Twilio-ModalPopupWithEntryControl {
    padding-top: 7px;
    padding-bottom: 7px;
  }
  div.Twilio-SideNav-Container {
    margin-right: 5px;
  } 
  div.Twilio-MainHeader {
    margin-bottom: 5px;
  }
  button.Twilio-TaskListFilter-TaskFilterButton {
    margin-right: 10px;
  }
  button.Twilio-TaskListFilter-TaskFilterButton > div.Twilio-Icon-Filter {
    margin-left: auto;
  }
  button.Twilio-TaskListFilter-TaskFilterButton > div.Twilio-Icon-FilterUp {
    margin-left: auto;
  }
  button.Twilio-TaskCanvasHeader-EndButton {
    border-radius: 14px;
    font-size: 13px;
    letter-spacing: 0px;
  }
  button.Twilio-MessageInput-SendButton {
    background: rgba(216, 27, 96, 0.8);
  }
  div.css-tega07 {
    background-color: ${colors.base2};
  }
`;
