import { FlexPlugin } from 'flex-plugin';
import React from 'react';
import ContactDataSubmissionComponent from './components/ContactDataSubmissionComponent';

const PLUGIN_NAME = 'EnforceContactDataSubmissionPlugin';



export default class EnforceContactDataSubmissionPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This plugin removes the 'Complete' button in the TaskCanvasHeader and
   * replaces its function with a button in the CRM pane.  This is to prevent
   * an agent from completing a task before data has been submitted to
   * the external HRM.
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) { 
    const onCompleteTask = (sid) => {
      flex.Actions.invokeAction("CompleteTask", { sid } );
    }

    flex.TaskCanvasHeader.Content.remove('actions', {
      if: props => props.task && props.task.status === 'wrapping'
    });

    flex.CRMContainer.Content.add(
      <ContactDataSubmissionComponent key="contact-submission" onCompleteTask={onCompleteTask} />,
      {
        sortOrder: -1,
      }
    );
  }
}
