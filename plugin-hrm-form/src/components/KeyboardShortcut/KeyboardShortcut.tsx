import React, { Component } from 'react';
import { Dialog, DialogContent, DialogTitle, List, ListItem, ListItemText, Typography } from '@material-ui/core';

import { KeyBoardShortcutRule } from './KeyboardShortcutManager';
import { keyboardGuide } from './KeyboardShortcutGuide';
import { PressedKeys } from '../../states/shortcuts/types';
import { getConfig } from '../../HrmFormPlugin';

type OwnProps = {
  shortcuts: KeyBoardShortcutRule[];
};

type ReduxProps = {
  shortcuts: KeyBoardShortcutRule[];
  pressedKeys: PressedKeys;
  isGuideModalOpen: boolean;
  updatePressedKeys: (pressedKeys: PressedKeys) => void;
  closeGuideModal: () => void;
};

type Props = OwnProps & ReduxProps;

// TODO: Make this a pure function component
class KeyboardShortcut extends Component<Props> {
  static displayName = 'KeyboardShortcut';

  componentDidMount() {
    window.addEventListener('keydown', this.keyboardEventListener, true);
    window.addEventListener('keyup', this.keyboardEventListener, true);

    const initialKeys = this.props.shortcuts.reduce<{ [key: string]: boolean }>((result, curr) => {
      curr.keys.forEach(key => (result[key] = false));
      return result;
    }, {});

    this.props.updatePressedKeys(initialKeys);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keyboardEventListener);
    window.removeEventListener('keyup', this.keyboardEventListener);
  }

  keyboardEventListener = (e: KeyboardEvent) => {
    /**
     * Here we use event.pressedKey to determine the key the user has typed.
     * If our shortcuts contains Shift or Alt, this pressed key value will be secondary
     * or terciary value of that key. Example: 3, #, £. I'm not sure if those secondary
     * and terciary values are consistent between different keyboards.
     *
     * One alternative to investigate is to use event.keyCode instead, that keeps the
     * same value, regardless if we're pressing Shift or Alt with it.
     */
    const { key: pressedKey, type: eventType, repeat } = e;
    const { tagName } = e.target as Element;
    console.log({ e, pressedKey });

    const { shortcutManager } = getConfig();

    /**
     * Shortcuts should not be single key. When we change them to be like 'Control + Command + Letter',
     * we can remove the bellow condition.
     */
    // Check user is not inputting text
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) {
      return;
    }

    // Check that this is a non-repeating key event
    if (repeat) return;

    if (eventType === 'keydown') {
      for (const { keys, action } of shortcutManager.shortcuts) {
        if (keys.every(key => key === pressedKey || this.props.pressedKeys[key])) {
          action();
          break;
        }
      }
    }

    /**
     * This part has an issue.
     * How it should work?
     * After a keydown event is detected, the related key is marked as TRUE on redux.
     * After the key is released, the keyup event for this key should go into this if condition, and thus,
     * this key will become FALSE on redux.
     *
     * What's the issue?
     * Sometimes the keyup event is not detected. For single key shortcuts, it looks like this issue never arises.
     * But for multiple keys short, such as 'Control + Command + M', if the action triggers things like an alert or a dialog,
     * the keyup event for the letter 'M' is not detected, and the 'M' key remains TRUE on redux, making the app behave wrong.
     * For some reason, the Control and Command keyup events seem to be always detected, but not the keyup events for letters.
     */
    if (this.props.pressedKeys[pressedKey] !== undefined) {
      const updatedPressedKeys = { ...this.props.pressedKeys, [pressedKey]: eventType === 'keydown' };
      this.props.updatePressedKeys(updatedPressedKeys);
    }
  };

  render() {
    return (
      <Dialog
        open={this.props.isGuideModalOpen}
        onClose={this.props.closeGuideModal}
        fullWidth
        maxWidth="sm"
        onBackdropClick={this.props.closeGuideModal}
      >
        <DialogTitle>Keyboard Shortcuts Help</DialogTitle>
        <DialogContent>
          <List>
            {keyboardGuide.map((shortcut, i) => {
              return (
                <ListItem divider={i !== keyboardGuide.length - 1} key={shortcut.description}>
                  <ListItemText>{shortcut.description}</ListItemText>
                  <Typography align="right">{shortcut.keys}</Typography>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>
    );
  }
}

export default KeyboardShortcut;
