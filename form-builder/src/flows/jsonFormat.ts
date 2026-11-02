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
 * Lays out the JSON a widget is given (a request body, a task's attributes) with two-space
 * indents, as Studio and twilio-iac write it.
 *
 * It's Studio's JSON, not strict JSON: Liquid ({{…}}, {%…%}) and Terraform (${…}, %{…}) can stand
 * as values (`"memory": {{trigger.memory | to_json}}`). So it isn't parsed and written out again,
 * which would also reorder keys like "1" and rewrite escapes: only the whitespace between the
 * parts changes. Strings and placeholders are kept exactly as they are.
 */

// Liquid and Terraform placeholders outside quotes, with how each one ends
const LIQUID_OPENERS: Record<string, string> = { '{{': '}}', '{%': '%}' };
const TERRAFORM_OPENERS = ['${', '%{'];

const tokenize = (text: string): string[] | undefined => {
  const tokens: string[] = [];
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    const pair = text.slice(i, i + 2);
    if (/\s/.test(char)) {
      i += 1;
    } else if (char === '"') {
      let end = i + 1;
      while (end < text.length && text[end] !== '"') end += text[end] === '\\' ? 2 : 1;
      if (end >= text.length) return undefined;
      tokens.push(text.slice(i, end + 1));
      i = end + 1;
    } else if (LIQUID_OPENERS[pair]) {
      const end = text.indexOf(LIQUID_OPENERS[pair], i + 2);
      if (end < 0) return undefined;
      tokens.push(text.slice(i, end + 2));
      i = end + 2;
    } else if (TERRAFORM_OPENERS.includes(pair)) {
      // Terraform expressions can hold braces of their own
      let depth = 0;
      let end = i + 1;
      for (; end < text.length; end += 1) {
        if (text[end] === '{') depth += 1;
        else if (text[end] === '}' && --depth === 0) break;
      }
      if (end >= text.length) return undefined;
      tokens.push(text.slice(i, end + 1));
      i = end + 1;
    } else if ('{}[],:'.includes(char)) {
      tokens.push(char);
      i += 1;
    } else {
      // A number, true, false or null
      let end = i;
      while (end < text.length && !/[\s{}[\],:"]/.test(text[end])) end += 1;
      tokens.push(text.slice(i, end));
      i = end;
    }
  }
  return tokens;
};

/**
 * The text laid out, or undefined if it can't be (an unclosed string or placeholder). Callers
 * check it's valid first (fieldProblem, taskAttributesProblem): this only changes the layout.
 */
export const formatTemplateJson = (text: string, indent = '  '): string | undefined => {
  const tokens = tokenize(text);
  if (!tokens || tokens.length === 0) return undefined;
  let depth = 0;
  let out = '';
  const newLine = () => `\n${indent.repeat(Math.max(depth, 0))}`;
  for (let k = 0; k < tokens.length; k += 1) {
    const token = tokens[k];
    if (token === '{' || token === '[') {
      const closing = token === '{' ? '}' : ']';
      // Empty ones stay on one line
      if (tokens[k + 1] === closing) {
        out += token + closing;
        k += 1;
      } else {
        depth += 1;
        out += token + newLine();
      }
    } else if (token === '}' || token === ']') {
      depth -= 1;
      out += newLine() + token;
    } else if (token === ',') {
      out += `,${newLine()}`;
    } else if (token === ':') {
      out += ': ';
    } else {
      out += token;
    }
  }
  return out;
};
