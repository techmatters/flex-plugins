/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

const CONTAINER_ID = 'twilio-customer-frame';
const HELPLINE_SELECT_ID = 'menu-helpline';
const LANGUAGE_SELECT_ID = 'menu-language';

// Array of ids from elements that need z-index update
const nodeIds = [CONTAINER_ID, LANGUAGE_SELECT_ID, HELPLINE_SELECT_ID];

/**
 * Updates Webchat container z-index with the value provided by the client.
 * Sample: <script src="point/to/aselo-webchat.min.js" data-z-index="200">
 *
 * How it works?
 * It uses MutationObserver to listen to DOM changes. Everytime it detects a new node was added
 * to `document.body` (or children), it checks if this element needs to have its z-index set.
 */
export function updateZIndex() {
  const zIndex = document?.currentScript?.getAttribute('data-z-index');
  if (zIndex === null || zIndex === undefined) return;

  const observer = new window.MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (isHTMLElement(node) && nodeIds.includes(node.id)) {
          node.style.zIndex = zIndex;

          if (CONTAINER_ID === node.id) {
            node.style.position = 'relative';
          }
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function isHTMLElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

export function getWebChatAttributeValues() {
  const externalWebChatLanguage = document?.currentScript?.getAttribute('data-language');
  const color = document?.currentScript?.getAttribute('data-color');
  const backgroundColor = document?.currentScript?.getAttribute('data-background-color');

  // used to turn on/off captcha and send messages to correct queue
  const e2eTestMode = document?.currentScript?.getAttribute('data-e2e-test-mode') === 'true';

  return { externalWebChatLanguage, color, backgroundColor, e2eTestMode };
}
