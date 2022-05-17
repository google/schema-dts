/**
 * Copyright 2021 Google LLC
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

import ts from 'typescript';
import type {Node} from 'typescript';
const {setSyntheticLeadingComments, SyntaxKind} = ts;

import {unified} from 'unified';
import type {Processor} from 'unified';
import markdown from 'remark-parse';
import html from 'rehype-parse';
import type {Literal, Node as AstNode, Parent} from 'unist';
import wikiLinkPlugin from 'remark-wiki-link';
import mdastToHast from 'remark-rehype';
import stripWhitespace from 'rehype-minify-whitespace';
import raw from 'rehype-raw';

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

export function appendParagraph(
  first: string | undefined,
  next: string
): string {
  if (!first) return next;
  if (shouldParseAsHtml(first)) return `${first}<br/><br/>${next}`;
  return `${first}\n\n${next}`;
}

function parseComment(comment: string): string {
  const parseAsHtml = shouldParseAsHtml(comment);
  const commentToParse = unescape(comment);
  const processor = parseAsHtml
    ? unified().use(html, {fragment: true}).use(stripWhitespace)
    : unified()
        .use(markdown)
        .use(wikiLinkPlugin, {
          hrefTemplate: s => `https://schema.org/${s}`,
          pageResolver: s => [s],
          aliasDivider: '|',
        })
        .use(mdastToHast, {allowDangerousHtml: true})
        .use(raw)
        .use(stripWhitespace);

  const ast = parseCommentInternal(processor, commentToParse);

  const context: ParseContext = {
    result: [],
    onTag: new Map([...universalHandlers, ...htmlHandlers]),
  };

  one(ast, context, {
    isFirstChild: true,
    isLastChild: true,
    parent: undefined,
  });

  const lines = context.result.join('').trim().split('\n');

  // Hack to get JSDOCs working. Microsoft does not expose JSDOC-creation API.
  return lines.length === 1
    ? `* ${lines[0]} `
    : '*\n * ' + lines.join('\n * ') + '\n ';
}

function parseCommentInternal<P extends Processor>(
  processor: P,
  comment: string
) {
  return processor.runSync(processor.parse(comment));
}

// Older Schema.org comment strings are represented as HTML, where whitespace
// and new lines are insignificant, and all meaning is expressed through HTML
// tags, including <a> and <br/>.
//
// Starting Schema.org 11, comments are represented as markdown. v11 still mixes
// some HTML with Markdown.
//
// To decide how we're handling them, we'll check for the presence of newlines
// without line break tags as a strong indication to use Markdown (even if other
//  HTML exists). Othrewise, we simply test for the existence of any HTML tag.
function shouldParseAsHtml(s: string): boolean {
  const BR = /<br\s*\/?>/gi;
  const NL = /\n/gi;
  if (NL.test(s) && !BR.test(s)) return false;

  // Any part of the string that is _not_ escaped in (`) cannot contain HTML in
  // a Markdown comment.
  //
  // Similarly, strip all `<code>` blocks entirely. These are somehow still
  // included in Markdown comments.
  const stripped = s
    .replace(/<code[^<>]*>((?!<\/code>).)*<\/code\s*>/gi, '')
    .replace(/(?!^)(`+)((?!\1).)+\1/g, '');
  return /<[A-Za-z][A-Za-z0-9-]*(\s[^<>]*)?>/g.test(stripped);
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
  close?(context: TagContext): string;
}

interface TagContext {
  readonly node: FriendlyNode;
  readonly isFirstChild: boolean;
  readonly isLastChild: boolean;
  readonly parent: FriendlyNode | undefined;
}

interface FriendlyNode {
  properties?: {[attribute: string]: string};
  url?: string;
  data: {
    alias?: string;
    permalink?: string;
  };
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

// Our top-level tag handler.
const universalHandlers: OnTagBuilder[] = [
  ['root', {}],
  ['text', {value: v => v}],
];

const htmlHandlers: OnTagBuilder[] = [
  [
    'p',
    {
      open: ({isFirstChild}) => (isFirstChild ? '' : '\n'),
      close: () => '\n',
    },
  ],
  [
    'a',
    {
      open: ({node}) => `{@link ${node.properties!['href']} `,
      close: () => '}',
    },
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
  [
    'code',
    {
      open({isFirstChild, isLastChild, parent}) {
        if (
          parent &&
          isFirstChild &&
          isLastChild &&
          getNodeType(parent as AstNode) === 'pre'
        ) {
          return '';
        }
        return '`';
      },
      close({isFirstChild, isLastChild, parent}) {
        if (
          parent &&
          isFirstChild &&
          isLastChild &&
          getNodeType(parent as AstNode) === 'pre'
        ) {
          return '';
        }
        return '`';
      },
    },
  ],
  ['pre', {open: () => '```\n', close: () => '\n```\n'}],
];

function one(
  node: AstNode,
  context: ParseContext,
  nodeContext: {
    isFirstChild: boolean;
    isLastChild: boolean;
    parent: FriendlyNode | undefined;
  }
): void {
  const handler = context.onTag.get(getNodeType(node));
  if (!handler) {
    throw new Error(
      `While parsing comment: unknown node type (${getNodeType(
        node
      )}) for: ${JSON.stringify(node, undefined, 2)}.`
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
        isLastChild: i === p.children.length - 1,
        parent: node as FriendlyNode,
      });
    }
  }

  if (handler.close) {
    context.result.push(
      handler.close({...nodeContext, node: node as FriendlyNode})
    );
  }
}

function getNodeType(node: AstNode): string {
  return node.type === 'element'
    ? (node as unknown as {tagName: string}).tagName
    : node.type;
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
