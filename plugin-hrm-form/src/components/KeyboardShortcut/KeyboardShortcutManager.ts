import * as Flex from '@twilio/flex-ui';

import { openGuideModal, closeGuideModal } from '../../states/shortcuts/actions';
import { namespace, shortcutBase } from '../../states';

export interface KeyBoardShortcutRule {
  keys: string[];
  action: () => void;
}

/**
 * Suggestion: we should make the methods of this class to be arrow functions,
 * so that we don't need to bind the instance to use the correct 'this' value.
 *
 * Right now, we're using these methods like this: shortcutManager.toggleGuide.bind(shortcutManager).
 * Notice the '.bind(shortcutManager)'. We can avoid that if we make these methods arrow functions.
 */
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

  public openAgentDesktop() {
    Flex.Actions.invokeAction('NavigateToView', { viewName: 'agent-desktop' });
  }
}

export default KeyboardShortcutManager;
