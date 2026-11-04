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

export type HclExpression = { expression: string };
export type HclValue = string | number | boolean | null | HclValue[] | HclObject | HclExpression;
export type HclObject = { [key: string]: HclValue };

export type HclBlock = { type: string; labels: string[]; body: HclBody };
export type HclBody = { attributes: HclObject; blocks: HclBlock[] };

export const isExpression = (value: HclValue | undefined): value is HclExpression =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  'expression' in value &&
  Object.keys(value).length === 1;

export const isObject = (value: HclValue | undefined): value is HclObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && !isExpression(value);

export class HclError extends Error {}

const IDENT = /[A-Za-z_][A-Za-z0-9_-]*/y;
const NUMBER = /-?\d+(\.\d+)?([eE][+-]?\d+)?/y;

class Parser {
  private at = 0;

  constructor(private readonly text: string) {}

  private fail(message: string): never {
    const line = this.text.slice(0, this.at).split('\n').length;
    throw new HclError(`${message} (line ${line})`);
  }

  private peek(offset = 0) {
    return this.text[this.at + offset];
  }

  private startsWith(token: string) {
    return this.text.startsWith(token, this.at);
  }

  // Spaces, comments and (unless inline) newlines
  private skip(newlines = true) {
    for (;;) {
      const char = this.peek();
      if (char === ' ' || char === '\t' || char === '\r' || (newlines && char === '\n')) {
        this.at += 1;
      } else if (char === '#' || this.startsWith('//')) {
        while (this.at < this.text.length && this.peek() !== '\n') this.at += 1;
      } else if (this.startsWith('/*')) {
        const end = this.text.indexOf('*/', this.at + 2);
        this.at = end < 0 ? this.text.length : end + 2;
      } else {
        return;
      }
    }
  }

  private match(pattern: RegExp) {
    pattern.lastIndex = this.at;
    const found = pattern.exec(this.text);
    if (!found) return undefined;
    this.at += found[0].length;
    return found[0];
  }

  private expect(char: string) {
    this.skip();
    if (this.peek() !== char) this.fail(`Expected ${char}`);
    this.at += 1;
  }

  // A body: attributes (name = value) and blocks (name "label" { ... }), until } or the end
  parseBody(end?: string): HclBody {
    const body: HclBody = { attributes: {}, blocks: [] };
    for (;;) {
      this.skip();
      if (this.at >= this.text.length || (end && this.peek() === end)) return body;
      const name = this.peek() === '"' ? this.parseString() : this.match(IDENT);
      if (name === undefined) this.fail('Expected an attribute or a block');
      this.skip(false);
      if (this.peek() === '=' && this.peek(1) !== '=') {
        this.at += 1;
        body.attributes[name] = this.parseExpression();
        continue;
      }
      const labels: string[] = [];
      for (;;) {
        this.skip(false);
        if (this.peek() === '{') break;
        const label = this.peek() === '"' ? this.parseString() : this.match(IDENT);
        if (label === undefined) this.fail(`Expected = or a block after ${name}`);
        labels.push(label);
      }
      this.at += 1;
      const blockBody = this.parseBody('}');
      this.expect('}');
      body.blocks.push({ type: name, labels, body: blockBody });
    }
  }

  parseExpression(): HclValue {
    this.skip();
    const start = this.at;
    const value = this.parsePrimary();
    // Anything after a value on the same line (an operator, an attribute access...) makes it an
    // expression we don't evaluate
    const afterValue = this.at;
    this.skip(false);
    const next = this.peek();
    if (next !== undefined && !',}])\n'.includes(next) && !this.startsWith('//') && next !== '#') {
      this.at = start;
      return { expression: this.rawExpression() };
    }
    this.at = afterValue;
    return value;
  }

  private parsePrimary(): HclValue {
    const char = this.peek();
    if (char === '{') return this.parseObject();
    if (char === '[') return this.parseList();
    if (char === '"') return this.parseString();
    if (this.startsWith('<<')) return this.parseHeredoc();
    if (char === '$' && this.peek(1) === '{') {
      // A bare interpolation (`${ jsonencode({...}) }`, as templates are written)
      const raw = this.rawInterpolation();
      const inner = raw.slice(2, -1);
      const nested = new Parser(inner);
      try {
        const value = nested.parseExpression();
        nested.skip();
        if (nested.at >= inner.length) return value;
      } catch {
        // Not something we read
      }
      return { expression: raw };
    }
    const number = this.match(NUMBER);
    if (number !== undefined) return Number(number);
    const start = this.at;
    const ident = this.match(/[A-Za-z_][A-Za-z0-9_]*/y);
    if (ident === 'true' || ident === 'false') return ident === 'true';
    if (ident === 'null') return null;
    if (ident && this.peek() === '(') {
      if (ident === 'jsonencode') {
        this.at += 1;
        const value = this.parseExpression();
        this.expect(')');
        return value;
      }
    }
    this.at = start;
    return { expression: this.rawExpression() };
  }

  private parseObject(): HclObject {
    this.at += 1;
    const object: HclObject = {};
    for (;;) {
      this.skip();
      if (this.peek() === '}') {
        this.at += 1;
        return object;
      }
      let key: string | undefined;
      if (this.peek() === '"') key = this.parseString();
      else if (this.peek() === '(') key = this.rawExpression();
      else key = this.match(IDENT);
      if (key === undefined) this.fail('Expected a key');
      this.skip(false);
      if (this.peek() !== '=' && this.peek() !== ':') this.fail(`Expected = or : after ${key}`);
      this.at += 1;
      object[key] = this.parseExpression();
      this.skip();
      if (this.peek() === ',') this.at += 1;
    }
  }

  private parseList(): HclValue[] {
    this.at += 1;
    const list: HclValue[] = [];
    for (;;) {
      this.skip();
      if (this.peek() === ']') {
        this.at += 1;
        return list;
      }
      list.push(this.parseExpression());
      this.skip();
      if (this.peek() === ',') this.at += 1;
    }
  }

  // A quoted string; interpolations (${...}, %{...}) are kept as they're written
  parseString(): string {
    this.at += 1;
    let result = '';
    for (;;) {
      const char = this.peek();
      if (char === undefined) this.fail('Unterminated string');
      if (char === '"') {
        this.at += 1;
        return result;
      }
      if (char === '\\') {
        const escaped = this.peek(1);
        this.at += 2;
        if (escaped === 'n') result += '\n';
        else if (escaped === 't') result += '\t';
        else if (escaped === 'r') result += '\r';
        else if (escaped === 'u') {
          result += String.fromCharCode(parseInt(this.text.slice(this.at, this.at + 4), 16));
          this.at += 4;
        } else result += escaped;
      } else if (this.startsWith('$${') || this.startsWith('%%{')) {
        result += `${char}{`;
        this.at += 3;
      } else if ((char === '$' || char === '%') && this.peek(1) === '{') {
        result += this.rawInterpolation();
      } else {
        result += char;
        this.at += 1;
      }
    }
  }

  // ${ ... } with whatever is inside, braces and strings included
  private rawInterpolation(): string {
    const start = this.at;
    this.at += 2;
    let depth = 1;
    while (depth > 0) {
      const char = this.peek();
      if (char === undefined) this.fail('Unterminated interpolation');
      if (char === '"') {
        this.parseString();
        continue;
      }
      if (char === '{') depth += 1;
      if (char === '}') depth -= 1;
      this.at += 1;
    }
    return this.text.slice(start, this.at);
  }

  private parseHeredoc(): string {
    const header = this.match(/<<-?([A-Za-z_][A-Za-z0-9_]*)[ \t]*\r?\n/y);
    if (!header) this.fail('Invalid heredoc');
    const indented = header.startsWith('<<-');
    const marker = header.replace(/^<<-?/, '').trim();
    const lines: string[] = [];
    for (;;) {
      const lineEnd = this.text.indexOf('\n', this.at);
      const line = this.text.slice(this.at, lineEnd < 0 ? undefined : lineEnd).replace(/\r$/, '');
      this.at = lineEnd < 0 ? this.text.length : lineEnd + 1;
      if (line.trim() === marker) break;
      if (lineEnd < 0) this.fail('Unterminated heredoc');
      lines.push(line);
    }
    if (!indented) return `${lines.join('\n')}\n`;
    const indent = Math.min(...lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)![0].length));
    return `${lines.map((line) => line.slice(indent)).join('\n')}\n`;
  }

  // An expression we don't read, as written: up to the end of the line (or a , } ] at depth 0)
  private rawExpression(): string {
    const start = this.at;
    let depth = 0;
    while (this.at < this.text.length) {
      const char = this.peek();
      if (char === '"') {
        this.parseString();
        continue;
      }
      if (char === '$' && this.peek(1) === '{') {
        this.rawInterpolation();
        continue;
      }
      if ('([{'.includes(char)) depth += 1;
      if (')]}'.includes(char)) {
        if (depth === 0) break;
        depth -= 1;
      }
      if (depth === 0 && (char === ',' || char === '\n')) break;
      this.at += 1;
    }
    return this.text.slice(start, this.at).trim();
  }

  atEnd() {
    this.skip();
    return this.at >= this.text.length;
  }
}

export const parseHcl = (text: string): HclBody => {
  const parser = new Parser(text);
  const body = parser.parseBody();
  if (!parser.atEnd()) throw new HclError('Unexpected text at the end');
  return body;
};

/**
 * A Studio flow template (.tftpl) as a value: `${ jsonencode({...}) }`, or JSON with
 * interpolations in its strings.
 */
export const parseTemplate = (text: string): HclValue => {
  const parser = new Parser(text);
  const value = parser.parseExpression();
  if (!parser.atEnd()) throw new HclError('Unexpected text after the flow');
  return value;
};

// The locals of a Terragrunt file, merged across its locals blocks
export const localsOf = (body: HclBody): HclObject =>
  Object.assign({}, ...body.blocks.filter((block) => block.type === 'locals').map((block) => block.body.attributes));
