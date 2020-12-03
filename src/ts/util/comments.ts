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

import unified from 'unified';
import markdown from 'remark-parse';
import html from 'rehype-parse';
import {Node, setSyntheticLeadingComments, SyntaxKind} from 'typescript';
import type {Literal, Node as AstNode, Parent} from 'unist';

export function withComments<T extends Node>(
  comment: string | undefined,
  node: T
): T {
  if (!comment) return node;

  try {
    return setSyntheticLeadingComments(node, [
      {
        text: parseComment(comment),
        kind: SyntaxKind.MultiLineCommentTrivia,
        hasTrailingNewLine: true,
        pos: -1,
        end: -1,
      },
    ]);
  } catch (error) {
    throw new Error(`${error}\n... while processing comment:\n${comment}`);
  }
}

export function appendLine(first: string | undefined, next: string): string {
  if (!first) return next;
  if (shouldParseAsHtml(first)) return `${first}<br/>${next}`;
  return `${first}\n\n${next}`;
}

function parseComment(comment: string): string {
  const parseAsHtml = shouldParseAsHtml(comment);

  const processor = parseAsHtml
    ? unified().use(html, {fragment: true})
    : unified().use(markdown);

  const ast = processor.runSync(processor.parse(unescape(comment)));

  const context: ParseContext = {
    result: [],
    onTag: new Map(
      parseAsHtml
        ? [...universalHandlers, ...htmlHandlers]
        : [...universalHandlers, ...markdownHandlers]
    ),
  };

  one(ast, context, {isFirstChild: true});

  const lines = context.result.join('').trim().split('\n');

  // Hack to get JSDOCs working. Microsoft does not expose JSDOC-creation API.
  return lines.length === 1
    ? `* ${lines[0]} `
    : '*\n * ' + lines.join('\n * ') + '\n ';
}

// Older Schema.org comment strings are represented as HTML, where whitespace
// and new lines are insignificant, and all meaning is expressed through HTML
// tags, including <a> and <br/>.
//
// Starting Schema.org 11, comments are represented as markdown.
//
// To decide how we're handling them, we'll simply check for the presence of
// *any* HTML tag. Without, we'll assume markup.
function shouldParseAsHtml(s: string): boolean {
  return /<[A-Za-z][A-Za-z0-9-]*[^>]*>/g.test(s);
}

interface ParseContext {
  readonly result: string[];
  readonly onTag: Map<string, OnTag>;
}
type OnTagBuilder = readonly [string, OnTag];

// Tag Management: Define functions describing what to do with HTML tags in our
// comments.
interface OnTag {
  value?(value: string): string;
  open?(context: TagContext): string;
  close?(context: {isFirstChild: boolean}): string;
}

interface TagContext {
  readonly node: FriendlyNode;
  readonly isFirstChild: boolean;
}

interface FriendlyNode {
  properties?: {[attribute: string]: string};
  url?: string;
}

// Some handlers for behaviors that apply to multiple tags:
const em: OnTag = {
  open: () => '_',
  close: () => '_',
};
const strong: OnTag = {
  open: () => '__',
  close: () => '__',
};
const code: OnTag = {
  open: () => '`',
  close: () => '`',
};

// Our top-level tag handler.
const universalHandlers: OnTagBuilder[] = [
  ['root', {}],
  ['text', {value: v => sanitizeText(v)}],
  [
    'paragraph',
    {open: ({isFirstChild}) => (isFirstChild ? '' : '\n'), close: () => '\n'},
  ],
];

const htmlHandlers: OnTagBuilder[] = [
  [
    'a',
    {open: ({node}) => `{@link ${node.properties!['href']} `, close: () => '}'},
  ],
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
];

const markdownHandlers: OnTagBuilder[] = [
  ['link', {open: ({node}) => `{@link ${node.url} `, close: () => '}'}],
  ['emphasis', em],
  ['strong', strong],
  ['inlineCode', code],
  ['list', {}],
  ['listItem', {open: () => '- '}],
  ['html', {}], // Ignore HTML in Markdown. We shouldn't get here, but v11 for example contains an erroneous `</a>`.
  ['code', {open: () => '```', close: () => '```', value: v => v}],
];

function one(
  node: AstNode,
  context: ParseContext,
  nodeContext: {isFirstChild: boolean}
): void {
  const handler =
    node.type === 'element'
      ? context.onTag.get(((node as unknown) as {tagName: string}).tagName)
      : context.onTag.get(node.type);
  if (!handler) {
    throw new Error(
      `While parsing comment: unknown node type for: ${JSON.stringify(
        node,
        undefined,
        2
      )}.`
    );
  }

  if (handler.open) {
    context.result.push(
      handler.open({...nodeContext, node: node as FriendlyNode})
    );
  }

  if (handler.value && (node as Literal).value) {
    context.result.push(handler.value((node as Literal).value as string));
  }

  if ((node as Parent).children) {
    const p = node as Parent;
    for (let i = 0; i < p.children.length; ++i) {
      const child = p.children[i];
      one(child, context, {
        isFirstChild: i === 0,
      });
    }
  }

  if (handler.close) {
    context.result.push(handler.close(nodeContext));
  }
}
// String Replacement: make sure we replace unicode strings as needed, wherever
// they show up as text.
const replacer: Array<[RegExp, string]> = [
  [/\\?\\n/g, '\n'],
  [/\\?\\u2014/gi, '\u2014'],
  [/\\?\\u2019/gi, '\u2019'],
  [/\\?\\u00A3/gi, '\u00A3'],
];
function unescape(str: string): string {
  for (const [regexp, replacement] of replacer) {
    str = str.replace(regexp, replacement);
  }
  return str;
}
function sanitizeText(str: string): string {
  return str.replace(/\s+/g, ' ');
}
