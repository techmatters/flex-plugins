/**
 * Copyright (C) 2021-2026 Technology Matters
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

/**
 * The webchat shows checkbox labels as HTML (usually for a link to terms and conditions).
 * The preview shows them too, but only simple formatting and web or email links, so text
 * typed into a draft can't run anything in the browser of whoever reviews it.
 */
const ALLOWED_TAGS = new Set(['A', 'B', 'STRONG', 'I', 'EM', 'U', 'BR', 'SPAN', 'P']);
const SAFE_LINK = /^(https?:|mailto:)/i;

const clean = (source: Node, target: Node, doc: Document) => {
  source.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      target.appendChild(doc.createTextNode(child.textContent ?? ''));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const element = child as Element;
    if (!ALLOWED_TAGS.has(element.tagName)) {
      // Keep the text of anything else, without the element itself
      clean(element, target, doc);
      return;
    }
    const copy = doc.createElement(element.tagName.toLowerCase());
    if (element.tagName === 'A') {
      const href = element.getAttribute('href') ?? '';
      if (SAFE_LINK.test(href.trim())) copy.setAttribute('href', href.trim());
      copy.setAttribute('target', '_blank');
      copy.setAttribute('rel', 'noreferrer');
    }
    clean(element, copy, doc);
    target.appendChild(copy);
  });
};

export const sanitizeLabelHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const output = doc.createElement('div');
  clean(doc.body, output, doc);
  return output.innerHTML;
};
