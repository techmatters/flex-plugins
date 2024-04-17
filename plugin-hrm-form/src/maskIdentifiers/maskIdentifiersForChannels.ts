import { DefaultTaskChannels, TaskChannelDefinition } from '@twilio/flex-ui';

import { getInitializedCan, PermissionActions } from '../permissions';
import { getAseloFeatureFlags } from '../hrmConfig';

export const maskTemplatesWithIdentifiers = (channelType: TaskChannelDefinition) => {
  const can = getInitializedCan();
  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);
  if (!maskIdentifiers) return;

  const {
    IncomingTaskCanvas,
    TaskListItem,
    CallCanvas,
    TaskCanvasHeader,
    Supervisor,
    TaskCard,
    TaskInfoPanel,
  } = channelType.templates;

  IncomingTaskCanvas.firstLine = 'MaskIdentifiers';

  CallCanvas.firstLine = 'MaskIdentifiers';

  // Task list and panel when a call comes in
  TaskListItem.firstLine = 'MaskIdentifiers';
  TaskListItem.secondLine =
    channelType === DefaultTaskChannels.Chat ? 'TaskLineWebChatAssignedMasked' : 'TaskLineChatAssignedMasked';

  // Task panel during an active call
  TaskCanvasHeader.title = 'MaskIdentifiers';
  Supervisor.TaskCanvasHeader.title = 'MaskIdentifiers';

  // Task Status in Agents page
  if (!getAseloFeatureFlags().enable_teams_view_enhancements) TaskCard.firstLine = 'MaskIdentifiers';

  TaskInfoPanel.content = 'TaskInfoPanelContentMasked';

  Supervisor.TaskOverviewCanvas.firstLine = 'MaskIdentifiers';
  Supervisor.TaskInfoPanel.content = 'TaskInfoPanelContentMasked';
};
