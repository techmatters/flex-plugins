import { Manager } from '@twilio/flex-ui';
export const adjustTaskCapacity = (adjustment) => {
    const url = 'https://periwinkle-jaguar-1552.twil.io/change-task-amount';
    const worker = Manager.getInstance().workerClient;
    let channelSid = '';
    for (const channel of worker.channels){
        if(channel[1].taskChannelUniqueName === 'chat'){
            channelSid = channel[1].sid;
            break;
        }
    }
  console.log(channelSid);
    let data = {
      workerSid: worker.sid,
      workspaceSid: worker.workspaceSid,
      workerChannels: channelSid,
      workerLimit: worker.attributes.maxMessageCapacity,
      increasing: adjustment,
    };
    const defaultOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    let response = fetch(url,defaultOptions);
  }