import { FlexPlugin } from 'flex-plugin';
import React from 'react';
import ContactDataSubmissionComponent from './components/ContactDataSubmissionComponent';

const PLUGIN_NAME = 'EnforceContactDataSubmissionPlugin';



export default class EnforceContactDataSubmissionPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) { 
    const onCompleteTask = (sid) => {
      flex.Actions.invokeAction("CompleteTask", { sid } );
    }

    // flex.Actions.registerAction("submitData", (payload) => {
    //   flex.Actions.invokeAction("SetComponentState", {
    //     name: "DataChanger", state: { canComplete: true }
    //   });
    //   // alert("data submitted!");
    // });
    //flex.AgentDesktopView.Panel2.Content.add(
    // flex.Actions.addListener("beforeCompleteTask", (payload, abortFunction) => {
    //   if (!window.confirm("Did you submit your data?")) {
    //     abortFunction();
    //   }
    // });

    flex.TaskCanvasHeader.Content.remove('actions', {
      if: props => props.task && props.task.status === 'wrapping'
    });

    flex.CRMContainer.Content.add(
      <ContactDataSubmissionComponent key="demo-component" onCompleteTask={onCompleteTask} />,
      {
        sortOrder: -1,
      }
    );


  }
}
