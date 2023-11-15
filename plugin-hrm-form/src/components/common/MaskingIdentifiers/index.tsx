// /* eslint-disable import/no-unused-modules */
// /**
//  * Copyright (C) 2021-2023 Technology Matters
//  * This program is free software: you can redistribute it and/or modify
//  * it under the terms of the GNU Affero General Public License as published
//  * by the Free Software Foundation, either version 3 of the License, or
//  * (at your option) any later version.
//  *
//  * This program is distributed in the hope that it will be useful,
//  * but WITHOUT ANY WARRANTY; without even the implied warranty of
//  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  * GNU Affero General Public License for more details.
//  *
//  * You should have received a copy of the GNU Affero General Public License
//  * along with this program.  If not, see https://www.gnu.org/licenses/.
//  */
// import * as Flex from '@twilio/flex-ui';

// import { getTemplateStrings } from '../../../hrmConfig';
// import { setUpViewMaskedVoiceNumber } from '../../../utils/setUpComponents';

// export const maskIdentifiersByChannel = channelType => {
//   // Task list and panel when a call comes in
//   channelType.templates.TaskListItem.firstLine = 'MaskIdentifiers';
//   if (channelType === Flex.DefaultTaskChannels.Chat) {
//     channelType.templates.TaskListItem.secondLine = 'TaskLineWebChatAssignedMasked';
//   } else {
//     channelType.templates.TaskListItem.secondLine = 'TaskLineChatAssignedMasked';
//   }
//   channelType.templates.IncomingTaskCanvas.firstLine = 'MaskIdentifiers';
//   channelType.templates.CallCanvas.firstLine = 'MaskIdentifiers';

//   // Task panel during an active call
//   channelType.templates.TaskCanvasHeader.title = 'MaskIdentifiers';
//   channelType.templates.MessageListItem = 'MaskIdentifiers';
//   // Task Status in Agents page
//   channelType.templates.TaskCard.firstLine = 'MaskIdentifiers';
//   // Supervisor
//   channelType.templates.Supervisor.TaskCanvasHeader.title = 'MaskIdentifiers';
//   channelType.templates.Supervisor.TaskOverviewCanvas.title = 'MaskIdentifiers';
// };

// const maskIdentifiersForDefaultChannels = () => {
//   maskIdentifiersByChannel(Flex.DefaultTaskChannels.Call);
//   maskIdentifiersByChannel(Flex.DefaultTaskChannels.Chat);
//   maskIdentifiersByChannel(Flex.DefaultTaskChannels.ChatSms);
//   maskIdentifiersByChannel(Flex.DefaultTaskChannels.Default);
//   maskIdentifiersByChannel(Flex.DefaultTaskChannels.ChatMessenger);
//   maskIdentifiersByChannel(Flex.DefaultTaskChannels.ChatWhatsApp);
// };

// export const setUpMaskedIdentifiers = () => {
//   // Mask the identifiers in all default channels
//   maskIdentifiersForDefaultChannels();

//   // Mask the username within the messable bubbles in an conversation
//   Flex.MessagingCanvas.defaultProps.memberDisplayOptions = {
//     theirDefaultName: 'XXXXXX',
//     theirFriendlyNameOverride: false,
//     yourFriendlyNameOverride: true,
//   };
//   Flex.MessageList.Content.remove('0');
//   // Masks TaskInfoPanelContent - TODO: refactor to use a react component
//   const strings = getTemplateStrings();
//   strings.TaskInfoPanelContent = strings.TaskInfoPanelContentMasked;
//   strings.CallParticipantCustomerName = strings.MaskIdentifiers;

//   setUpViewMaskedVoiceNumber();
// };
export {};