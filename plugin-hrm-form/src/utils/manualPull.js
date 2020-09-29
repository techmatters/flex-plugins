import { Manager } from '@twilio/flex-ui';
export const requestTask = (adjustment) => {
    const url = 'https://periwinkle-jaguar-1552.twil.io/change-task-amount';
    const worker = Manager.getInstance().workerClient;
    let channelSid = '';
    worker.channels.forEach(channel => {
    console.log(channel);
        if(channel.taskChannelUniqueName === 'chat'){
            channelSid = channel.sid;
        }
    });
  console.log(channelSid);
    let data = {
      workerSid: worker.sid,
      workspaceSid: worker.workspaceSid,
      workerChannels: channelSid,
      workerLimit: worker.attributes.maxMessageCapacity,
      increasing: adjustment,
    };
    console.log(data);
    const defaultOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    let response = fetch(url,defaultOptions);
  }