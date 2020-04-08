/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Parser} from 'htmlparser2';
import {Node, setSyntheticLeadingComments, SyntaxKind} from 'typescript';
import {assert} from '../../util/assert';

// String Replacement: make sure we replace unicode strings as needed, wherever
// they show up as text.
const replacer: Array<[RegExp, string]> = [
  [/\\n/g, ''],
  [/\\u2014/gi, '\u2014'],
  [/\\u2019/gi, '\u2019'],
  [/\\u00A3/gi, '\u00A3'],
];
function replace(str: string): string {
  for (const [regexp, replacement] of replacer) {
    str = str.replace(regexp, replacement);
  }
  return str;
}

// Tag Management: Define functions describing what to do with HTML tags in our
// comments.
interface OnTag {
  open?(attrs: {[key: string]: string}): string;
  close?(): string;
}

// Some handlers for behaviors that apply to multiple tags:
const em: OnTag = {
  open: () => '_',
  close: () => '_',
};
const strong = {
  open: () => '__',
  close: () => '__',
};
const code = {
  open: () => '`',
  close: () => '`',
};

// Our top-level tag handler.
const onTag = new Map<string, OnTag>([
  ['a', {open: attrs => `{@link ${attrs['href']} `, close: () => '}'}],
  ['em', em],
  ['i', em],
  ['strong', strong],
  ['b', strong],
  ['br', {open: () => '\n' /* Ignore closing of <BR> */}],
  ['li', {open: () => '- ', close: () => '\n'}],
  [
    'ul',
    {
      /* Ignore <UL> entirely. */
    },
  ],
  ['code', code],
  ['pre', code],
]);

function parseComment(comment: string): string {
  const result: string[] = [];
  const parser = new Parser({
    ontext: (text: string) => result.push(replace(text)),
    onopentag: (tag: string, attrs: {[key: string]: string}) => {
      const handler = onTag.get(tag);
      if (!handler) {
        throw new Error(`Unknown tag "${tag}".`);
      }

      if (handler.open) {
        result.push(handler.open(attrs));
      }
    },
    onclosetag: (tag: string) => {
      const handler = onTag.get(tag);
      assert(handler);

      if (handler.close) {
        result.push(handler.close());
      }
    },
  });
  parser.write(comment);
  parser.end();

  const lines = result.join('').split('\n');
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  // Hack to get JSDOCs working. Microsoft does not expose JSDOC-creation API.
  return lines.length === 1
    ? `* ${lines[0]} `
    : '*\n * ' + lines.join('\n * ') + '\n ';
}

export function withComments<T extends Node>(
  comment: string | undefined,
  node: T
): T {
  if (!comment) return node;

  return setSyntheticLeadingComments(node, [
    {
      text: parseComment(comment),
      kind: SyntaxKind.MultiLineCommentTrivia,
      hasTrailingNewLine: true,
      pos: -1,
      end: -1,
    },
  ]);
}
