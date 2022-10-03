import { injectGlobal } from 'react-emotion';

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
    border-radius: 4px;
    font-size: 13px;
    letter-spacing: 0px;
  }
  button.Twilio-MessageInput-SendButton {
    background: rgba(216, 27, 96, 0.8);
  }

  a.link-text-decoration-none { text-decoration: none; color: #1874e1; }
  a.link-text-decoration-none:visited { text-decoration: none; color: #1874e1; }
  a.link-text-decoration-none:hover { text-decoration: none; color: #1874e1; }
  a.link-text-decoration-none:focus { text-decoration: none; color: #1874e1; }
  a.link-text-decoration-none:active { text-decoration: none; color: #1874e1; }

  span.ContactDetailsInfo-open-in-new-icon {
    width: 16px;
    height: 16px;
    font-size: 16px;
  }
  
  .editingContact .hiddenWhenEditingContact {
    display: none;
  }

  .Twilio-ViewCollection {
    background-color: #f6f6f6;
  }

  .Twilio-SidePanel-Title.Twilio-SidePanel-TranscriptPlayer-Title {
    text-transform: capitalize;
    letter-spacing: inherit;
    font-size: 14px;
  }
`;
