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
 * Reads the HCL in twilio-iac: the helplines' Terragrunt files (common.hcl, staging.hcl...) and
 * the Studio flow templates, most of which are `${ jsonencode({ ... }) }`. Only what's needed to
 * read values, not to evaluate them:
 *
 * - literals (strings, numbers, booleans, null), objects and lists become plain values;
 * - strings keep their interpolations as text (`${flow_vars.x}` stays `${flow_vars.x}`);
 * - `jsonencode(x)` is x;
 * - any other expression (`merge(...)`, `local.config`, `a ? b : c`) is kept as { expression }.
 */

type HclExpression = { expression: string };
export type HclValue = string | number | boolean | null | HclValue[] | HclObject | HclExpression;
export type HclObject = { [key: string]: HclValue };

type HclBlock = { type: string; labels: string[]; body: HclBody };
type HclBody = { attributes: HclObject; blocks: HclBlock[] };

const isExpression = (value: HclValue | undefined): value is HclExpression =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  'expression' in value &&
  Object.keys(value).length === 1;

export const isObject = (value: HclValue | undefined): value is HclObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && !isExpression(value);

class HclError extends Error {}

const IDENT = /[A-Za-z_][A-Za-z0-9_-]*/y;
const NUMBER = /-?\d+(\.\d+)?([eE][+-]?\d+)?/y;

const newParser = (text: string) => {
  let at = 0;

  // A declaration, not an arrow function, so TypeScript knows nothing runs after a call
  function fail(message: string): never {
    const line = text.slice(0, at).split('\n').length;
    throw new HclError(`${message} (line ${line})`);
  }

  const peek = (offset = 0) => {
    return text[at + offset];
  };

  const startsWith = (token: string) => {
    return text.startsWith(token, at);
  };

  // Spaces, comments and (unless inline) newlines
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const skip = (newlines = true) => {
    for (;;) {
      const char = peek();
      if (char === ' ' || char === '\t' || char === '\r' || (newlines && char === '\n')) {
        at += 1;
      } else if (char === '#' || startsWith('//')) {
        while (at < text.length && peek() !== '\n') at += 1;
      } else if (startsWith('/*')) {
        const end = text.indexOf('*/', at + 2);
        at = end < 0 ? text.length : end + 2;
      } else {
        return;
      }
    }
  };

  const match = (pattern: RegExp) => {
    pattern.lastIndex = at;
    const found = pattern.exec(text);
    if (!found) return undefined;
    at += found[0].length;
    return found[0];
  };

  const expect = (char: string) => {
    skip();
    if (peek() !== char) fail(`Expected ${char}`);
    at += 1;
  };

  // A body: attributes (name = value) and blocks (name "label" { ... }), until } or the end
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const parseBody = (end?: string): HclBody => {
    const body: HclBody = { attributes: {}, blocks: [] };
    for (;;) {
      skip();
      if (at >= text.length || (end && peek() === end)) return body;
      const name = peek() === '"' ? parseString() : match(IDENT);
      if (name === undefined) fail('Expected an attribute or a block');
      skip(false);
      if (peek() === '=' && peek(1) !== '=') {
        at += 1;
        body.attributes[name] = parseExpression();
        continue;
      }
      const labels: string[] = [];
      for (;;) {
        skip(false);
        if (peek() === '{') break;
        const label = peek() === '"' ? parseString() : match(IDENT);
        if (label === undefined) fail(`Expected = or a block after ${name}`);
        labels.push(label);
      }
      at += 1;
      const blockBody = parseBody('}');
      expect('}');
      body.blocks.push({ type: name, labels, body: blockBody });
    }
  };

  const parseExpression = (): HclValue => {
    skip();
    const start = at;
    const value = parsePrimary();
    // Anything after a value on the same line (an operator, an attribute access...) makes it an
    // expression we don't evaluate
    const afterValue = at;
    skip(false);
    const next = peek();
    if (next !== undefined && !',}])\n'.includes(next) && !startsWith('//') && next !== '#') {
      at = start;
      return { expression: rawExpression() };
    }
    at = afterValue;
    return value;
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const parsePrimary = (): HclValue => {
    const char = peek();
    if (char === '{') return parseObject();
    if (char === '[') return parseList();
    if (char === '"') return parseString();
    if (startsWith('<<')) return parseHeredoc();
    if (char === '$' && peek(1) === '{') {
      // A bare interpolation (`${ jsonencode({...}) }`, as templates are written)
      const raw = rawInterpolation();
      const inner = raw.slice(2, -1);
      const nested = newParser(inner);
      try {
        const value = nested.parseExpression();
        nested.skip();
        if (nested.position() >= inner.length) return value;
      } catch {
        // Not something we read
      }
      return { expression: raw };
    }
    const number = match(NUMBER);
    if (number !== undefined) return Number(number);
    const start = at;
    const ident = match(/[A-Za-z_][A-Za-z0-9_]*/y);
    if (ident === 'true' || ident === 'false') return ident === 'true';
    if (ident === 'null') return null;
    if (ident === 'jsonencode' && peek() === '(') {
      at += 1;
      const value = parseExpression();
      expect(')');
      return value;
    }
    at = start;
    return { expression: rawExpression() };
  };

  const parseObject = (): HclObject => {
    at += 1;
    const object: HclObject = {};
    for (;;) {
      skip();
      if (peek() === '}') {
        at += 1;
        return object;
      }
      let key: string | undefined;
      if (peek() === '"') key = parseString();
      else if (peek() === '(') key = rawExpression();
      else key = match(IDENT);
      if (key === undefined) fail('Expected a key');
      skip(false);
      if (peek() !== '=' && peek() !== ':') fail(`Expected = or : after ${key}`);
      at += 1;
      object[key] = parseExpression();
      skip();
      if (peek() === ',') at += 1;
    }
  };

  const parseList = (): HclValue[] => {
    at += 1;
    const list: HclValue[] = [];
    for (;;) {
      skip();
      if (peek() === ']') {
        at += 1;
        return list;
      }
      list.push(parseExpression());
      skip();
      if (peek() === ',') at += 1;
    }
  };

  // A quoted string; interpolations (${...}, %{...}) are kept as they're written
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const parseString = (): string => {
    at += 1;
    let result = '';
    for (;;) {
      const char = peek();
      if (char === undefined) fail('Unterminated string');
      if (char === '"') {
        at += 1;
        return result;
      }
      if (char === '\\') {
        const escaped = peek(1);
        at += 2;
        if (escaped === 'n') result += '\n';
        else if (escaped === 't') result += '\t';
        else if (escaped === 'r') result += '\r';
        else if (escaped === 'u') {
          result += String.fromCharCode(parseInt(text.slice(at, at + 4), 16));
          at += 4;
        } else result += escaped;
      } else if (startsWith('$${') || startsWith('%%{')) {
        result += `${char}{`;
        at += 3;
      } else if ((char === '$' || char === '%') && peek(1) === '{') {
        result += rawInterpolation();
      } else {
        result += char;
        at += 1;
      }
    }
  };

  // ${ ... } with whatever is inside, braces and strings included
  const rawInterpolation = (): string => {
    const start = at;
    at += 2;
    let depth = 1;
    while (depth > 0) {
      const char = peek();
      if (char === undefined) fail('Unterminated interpolation');
      if (char === '"') {
        parseString();
        continue;
      }
      if (char === '{') depth += 1;
      if (char === '}') depth -= 1;
      at += 1;
    }
    return text.slice(start, at);
  };

  const parseHeredoc = (): string => {
    const header = match(/<<-?([A-Za-z_][A-Za-z0-9_]*)[ \t]*\r?\n/y);
    if (!header) fail('Invalid heredoc');
    const indented = header.startsWith('<<-');
    const marker = header.replace(/^<<-?/, '').trim();
    const lines: string[] = [];
    for (;;) {
      const lineEnd = text.indexOf('\n', at);
      const line = text.slice(at, lineEnd < 0 ? undefined : lineEnd).replace(/\r$/, '');
      at = lineEnd < 0 ? text.length : lineEnd + 1;
      if (line.trim() === marker) break;
      if (lineEnd < 0) fail('Unterminated heredoc');
      lines.push(line);
    }
    if (!indented) return `${lines.join('\n')}\n`;
    const indent = Math.min(...lines.filter(line => line.trim()).map(line => line.match(/^\s*/)![0].length));
    return `${lines.map(line => line.slice(indent)).join('\n')}\n`;
  };

  // An expression we don't read, as written: up to the end of the line (or a , } ] at depth 0)
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const rawExpression = (): string => {
    const start = at;
    let depth = 0;
    while (at < text.length) {
      const char = peek();
      if (char === '"') {
        parseString();
        continue;
      }
      if (char === '$' && peek(1) === '{') {
        rawInterpolation();
        continue;
      }
      if ('([{'.includes(char)) depth += 1;
      if (')]}'.includes(char)) {
        if (depth === 0) break;
        depth -= 1;
      }
      if (depth === 0 && (char === ',' || char === '\n')) break;
      at += 1;
    }
    return text.slice(start, at).trim();
  };

  const atEnd = () => {
    skip();
    return at >= text.length;
  };

  const position = () => at;

  return { parseBody, parseExpression, parseString, atEnd, skip, position };
};

export const parseHcl = (text: string): HclBody => {
  const parser = newParser(text);
  const body = parser.parseBody();
  if (!parser.atEnd()) throw new HclError('Unexpected text at the end');
  return body;
};

/**
 * A Studio flow template (.tftpl) as a value: `${ jsonencode({...}) }`, or JSON with
 * interpolations in its strings.
 */
export const parseTemplate = (text: string): HclValue => {
  const parser = newParser(text);
  const value = parser.parseExpression();
  if (!parser.atEnd()) throw new HclError('Unexpected text after the flow');
  return value;
};

// The locals of a Terragrunt file, merged across its locals blocks
export const localsOf = (body: HclBody): HclObject =>
  Object.assign({}, ...body.blocks.filter(block => block.type === 'locals').map(block => block.body.attributes));
