import * as Flex from '@twilio/flex-ui';

import { openGuideModal, closeGuideModal } from '../../states/shortcuts/actions';
import { namespace, shortcutBase } from '../../states';

export interface KeyBoardShortcutRule {
  keys: string[];
  action: () => void;
}

class KeyboardShortcutManager {
  private manager: Flex.Manager;

  public shortcuts: KeyBoardShortcutRule[];

  constructor(manager: Flex.Manager) {
    this.manager = manager;
    this.shortcuts = [];
  }

  public addShortcut(keys: string[], action: () => void) {
    this.shortcuts = [...this.shortcuts, { keys, action }];
  }

  public toggleGuide() {
    if (this.manager.store.getState()[namespace][shortcutBase].isGuideModalOpen) {
      this.manager.store.dispatch(closeGuideModal());
    } else {
      this.manager.store.dispatch(openGuideModal());
    }
  }

  public toggleSidebar() {
    Flex.Actions.invokeAction('ToggleSidebar');
  }

  public toggleAvailability() {
    const { activity } = this.manager.store.getState().flex.worker;
    if (activity.name === 'Offline' || activity.name === 'Unavailable') {
      Flex.Actions.invokeAction('SetActivity', { activityAvailable: true, activityName: 'Available' });
    }
    if (activity.name === 'Available') {
      Flex.Actions.invokeAction('SetActivity', { activityAvailable: false, activityName: 'Unavailable' });
    }
  }

  public openStandaloneSearch() {
    Flex.Actions.invokeAction('NavigateToView', { viewName: 'search' });
  }
}

export default KeyboardShortcutManager;
