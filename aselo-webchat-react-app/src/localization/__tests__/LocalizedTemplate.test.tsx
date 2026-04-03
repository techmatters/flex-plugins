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

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSelector } from 'react-redux';

import LocalizedTemplate from '../LocalizedTemplate';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

const translations = {
  'simple.text': 'Simple text',
  'template.param': 'Hello, {{name}}!',
  'html.bold': '<b>Bold text</b>',
  'html.italic': '<i>Italic text</i>',
  'html.emphasis': '<em>Emphasis text</em>',
  'html.strong': '<strong>Strong text</strong>',
  'html.underline': '<u>Underlined text</u>',
  'html.strikethrough': '<s>Strikethrough text</s>',
  'html.span': '<span class="highlight">Span text</span>',
  'html.linebreak': 'Line one<br>Line two',
  'html.link': '<a href="https://example.com" rel="noopener noreferrer">Click here</a>',
  'html.script': '<script>alert("xss")</script>malicious',
  'html.onerror': '<img src="x" onerror="alert(\'xss\')">',
  'html.onclick': '<b onclick="alert(\'xss\')">Bold</b>',
  // eslint-disable-next-line no-script-url
  'html.javascript.href': '<a href="javascript:alert(\'xss\')">Click</a>',
  'html.disallowed.tag': '<p>paragraph text</p>',
};

const mockUseSelector = useSelector as jest.Mock;

describe('LocalizedTemplate', () => {
  beforeEach(() => {
    mockUseSelector.mockImplementation((selectorFn: any) =>
      selectorFn({
        config: {
          translations: { 'en-US': translations },
          defaultLocale: 'en-US',
        },
      }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('plain text rendering (renderAsHtml not set)', () => {
    it('renders the translated text for a known key', () => {
      const { getByText } = render(<LocalizedTemplate code="simple.text" />);
      expect(getByText('Simple text')).toBeInTheDocument();
    });

    it('renders the key itself when no translation is found', () => {
      const { getByText } = render(<LocalizedTemplate code="unknown.key" />);
      expect(getByText('unknown.key')).toBeInTheDocument();
    });

    it('substitutes template parameters via Mustache', () => {
      const { getByText } = render(<LocalizedTemplate code="template.param" name="World" />);
      expect(getByText('Hello, World!')).toBeInTheDocument();
    });

    it('does not render a wrapping span element', () => {
      const { container } = render(<LocalizedTemplate code="simple.text" />);
      expect(container.querySelector('span')).not.toBeInTheDocument();
    });

    it('renders raw HTML as escaped text when renderAsHtml is not set', () => {
      const { container } = render(<LocalizedTemplate code="html.bold" />);
      expect(container.querySelector('b')).not.toBeInTheDocument();
      expect(container.textContent).toContain('<b>Bold text</b>');
    });
  });

  describe('HTML rendering (renderAsHtml="true")', () => {
    it('renders output in a span element', () => {
      const { container } = render(<LocalizedTemplate code="simple.text" renderAsHtml="true" />);
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('renders the translated text for a known key', () => {
      const { getByText } = render(<LocalizedTemplate code="simple.text" renderAsHtml="true" />);
      expect(getByText('Simple text')).toBeInTheDocument();
    });

    it('renders the key itself when no translation is found', () => {
      const { getByText } = render(<LocalizedTemplate code="unknown.key" renderAsHtml="true" />);
      expect(getByText('unknown.key')).toBeInTheDocument();
    });

    describe('permitted tags - text decoration and style', () => {
      it('permits <b> (bold) tags', () => {
        const { container } = render(<LocalizedTemplate code="html.bold" renderAsHtml="true" />);
        expect(container.querySelector('b')).toBeInTheDocument();
        expect(container.querySelector('b')).toHaveTextContent('Bold text');
      });

      it('permits <i> (italic) tags', () => {
        const { container } = render(<LocalizedTemplate code="html.italic" renderAsHtml="true" />);
        expect(container.querySelector('i')).toBeInTheDocument();
        expect(container.querySelector('i')).toHaveTextContent('Italic text');
      });

      it('permits <em> (emphasis) tags', () => {
        const { container } = render(<LocalizedTemplate code="html.emphasis" renderAsHtml="true" />);
        expect(container.querySelector('em')).toBeInTheDocument();
        expect(container.querySelector('em')).toHaveTextContent('Emphasis text');
      });

      it('permits <strong> tags', () => {
        const { container } = render(<LocalizedTemplate code="html.strong" renderAsHtml="true" />);
        expect(container.querySelector('strong')).toBeInTheDocument();
        expect(container.querySelector('strong')).toHaveTextContent('Strong text');
      });

      it('permits <u> (underline) tags', () => {
        const { container } = render(<LocalizedTemplate code="html.underline" renderAsHtml="true" />);
        expect(container.querySelector('u')).toBeInTheDocument();
        expect(container.querySelector('u')).toHaveTextContent('Underlined text');
      });

      it('permits <s> (strikethrough) tags', () => {
        const { container } = render(<LocalizedTemplate code="html.strikethrough" renderAsHtml="true" />);
        expect(container.querySelector('s')).toBeInTheDocument();
        expect(container.querySelector('s')).toHaveTextContent('Strikethrough text');
      });

      it('permits <span> tags', () => {
        const { container } = render(<LocalizedTemplate code="html.span" renderAsHtml="true" />);
        const innerSpan = container.querySelectorAll('span')[1]; // [0] is the wrapping span
        expect(innerSpan).toBeInTheDocument();
        expect(innerSpan).toHaveTextContent('Span text');
      });

      it('permits <br> tags', () => {
        const { container } = render(<LocalizedTemplate code="html.linebreak" renderAsHtml="true" />);
        expect(container.querySelector('br')).toBeInTheDocument();
      });
    });

    describe('permitted tags - links', () => {
      it('permits <a> tags with href and rel attributes', () => {
        const { container } = render(<LocalizedTemplate code="html.link" renderAsHtml="true" />);
        const anchor = container.querySelector('a');
        expect(anchor).toBeInTheDocument();
        expect(anchor).toHaveTextContent('Click here');
        expect(anchor).toHaveAttribute('href', 'https://example.com');
        expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    describe('XSS protection - unsafe tags are stripped', () => {
      it('strips <script> tags and their content', () => {
        const { container } = render(<LocalizedTemplate code="html.script" renderAsHtml="true" />);
        expect(container.querySelector('script')).not.toBeInTheDocument();
        expect(container.textContent).not.toContain('alert');
      });

      it('strips <img> tags with onerror handlers', () => {
        const { container } = render(<LocalizedTemplate code="html.onerror" renderAsHtml="true" />);
        expect(container.querySelector('img')).not.toBeInTheDocument();
      });

      it('strips on* event handler attributes from permitted tags', () => {
        const { container } = render(<LocalizedTemplate code="html.onclick" renderAsHtml="true" />);
        const boldEl = container.querySelector('b');
        expect(boldEl).toBeInTheDocument();
        expect(boldEl).not.toHaveAttribute('onclick');
      });

      it('strips javascript: protocol from href attributes', () => {
        const { container } = render(<LocalizedTemplate code="html.javascript.href" renderAsHtml="true" />);
        const anchor = container.querySelector('a');
        // DOMPurify either removes the <a> tag entirely or strips the unsafe href attribute
        if (anchor) {
          const href = anchor.getAttribute('href');
          // eslint-disable-next-line no-script-url
          expect(href === null || !href.includes('javascript:')).toBe(true);
        } else {
          // Anchor tag was removed entirely - also acceptable sanitization
          expect(anchor).toBeNull();
        }
      });

      it('strips disallowed tags such as <p> but preserves text content', () => {
        const { container } = render(<LocalizedTemplate code="html.disallowed.tag" renderAsHtml="true" />);
        expect(container.querySelector('p')).not.toBeInTheDocument();
        expect(container.textContent).toContain('paragraph text');
      });
    });
  });
});
