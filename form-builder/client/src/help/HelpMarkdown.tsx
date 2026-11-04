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
 * The little Markdown the help articles use, drawn as React elements (never as HTML): headings
 * (##, ###), paragraphs, lists (- and 1.; a guide's numbered list shows as steps), tips (> ...),
 * **bold**, `code`, and links: [text](help:<slug>) to another article, or to a web address.
 */
import { Fragment } from 'react';

type Props = {
  source: string;
  onOpenArticle: (slug: string) => void;
};

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

const Inline = ({ text, onOpenArticle }: { text: string; onOpenArticle: Props['onOpenArticle'] }) => (
  <>
    {text.split(INLINE).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
      const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (link) {
        const [, label, target] = link;
        if (target.startsWith('help:')) {
          return (
            <button key={index} type="button" className="help-link" onClick={() => onOpenArticle(target.slice(5))}>
              {label}
            </button>
          );
        }
        if (/^(https?:|mailto:)/.test(target)) {
          return (
            <a key={index} href={target} target="_blank" rel="noreferrer">
              {label}
            </a>
          );
        }
        return <Fragment key={index}>{label}</Fragment>;
      }
      return <Fragment key={index}>{part}</Fragment>;
    })}
  </>
);

type Block =
  | { kind: 'heading'; level: 2 | 3; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'tip'; text: string }
  | { kind: 'list'; ordered: boolean; items: { text: string; sub: string[] }[] };

export const blocksOf = (source: string): Block[] => {
  const blocks: Block[] = [];
  const lines = source.split(/\r?\n/);
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
    paragraph = [];
  };
  lines.forEach((raw) => {
    const line = raw.trimEnd();
    const heading = line.match(/^(##|###)\s+(.*)$/);
    const bullet = line.match(/^(\s*)-\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    const tip = line.match(/^>\s?(.*)$/);
    const continuation = line.match(/^\s{2,}(\S.*)$/);
    const last = blocks[blocks.length - 1];
    if (!line.trim()) return flush();
    if (heading) {
      flush();
      blocks.push({ kind: 'heading', level: heading[1] === '##' ? 2 : 3, text: heading[2] });
    } else if (bullet && bullet[1].length >= 2 && !paragraph.length && last?.kind === 'list') {
      // Indented under the item above
      last.items[last.items.length - 1].sub.push(bullet[2]);
    } else if (bullet || numbered) {
      flush();
      const ordered = Boolean(numbered);
      const text = bullet ? bullet[2] : numbered![1];
      if (last?.kind === 'list' && last.ordered === ordered) last.items.push({ text, sub: [] });
      else blocks.push({ kind: 'list', ordered, items: [{ text, sub: [] }] });
    } else if (continuation && !paragraph.length && last?.kind === 'list') {
      // A list item carried on over several lines
      const item = last.items[last.items.length - 1];
      if (item.sub.length) item.sub[item.sub.length - 1] += ` ${continuation[1]}`;
      else item.text += ` ${continuation[1]}`;
    } else if (tip) {
      flush();
      if (last?.kind === 'tip') last.text += ` ${tip[1]}`;
      else blocks.push({ kind: 'tip', text: tip[1] });
    } else {
      paragraph.push(line.trim());
    }
  });
  flush();
  return blocks;
};

export const HelpMarkdown = ({ source, onOpenArticle, steps }: Props & { steps?: boolean }) => (
  <div className="help-markdown">
    {blocksOf(source).map((block, index) => {
      switch (block.kind) {
        case 'heading':
          return block.level === 2 ? (
            <h4 key={index}>
              <Inline text={block.text} onOpenArticle={onOpenArticle} />
            </h4>
          ) : (
            <h5 key={index}>
              <Inline text={block.text} onOpenArticle={onOpenArticle} />
            </h5>
          );
        case 'tip':
          return (
            <p key={index} className="help-tip">
              <Inline text={block.text} onOpenArticle={onOpenArticle} />
            </p>
          );
        case 'list': {
          const List = block.ordered ? 'ol' : 'ul';
          return (
            <List key={index} className={block.ordered && steps ? 'help-steps' : undefined}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Inline text={item.text} onOpenArticle={onOpenArticle} />
                  {item.sub.length > 0 && (
                    <ul>
                      {item.sub.map((sub, subIndex) => (
                        <li key={subIndex}>
                          <Inline text={sub} onOpenArticle={onOpenArticle} />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </List>
          );
        }
        default:
          return (
            <p key={index}>
              <Inline text={block.text} onOpenArticle={onOpenArticle} />
            </p>
          );
      }
    })}
  </div>
);
