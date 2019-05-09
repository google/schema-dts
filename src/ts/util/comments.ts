/**
 * Copyright 2018 Google LLC
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

import {DomHandler, Parser} from 'htmlparser2';
import {Node, setSyntheticLeadingComments, SyntaxKind} from 'typescript';

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
function parseComment(comment: string): string {
  const result: string[] = [];
  const parser = new Parser(
      // FIXME: htmlparser2 domhandler typings seem wrong: (1) not a Partial
      // anymore, (2) onclosetag has no tagname. The JS source code seems to
      // tell a different story.
      // https://github.com/fb55/htmlparser2/blob/master/lib/Parser.js
      {
        ontext: (text: string) => result.push(replace(text)),
        onopentag: (tag: string, attrs: {[key: string]: string}) => {
          switch (tag) {
            case 'a':
              result.push(`{@link ${attrs['href']} `);
              break;
            case 'em':
            case 'i':
              result.push('_');
              break;
            case 'strong':
            case 'b':
              result.push('__');
              break;
            case 'br':
              result.push('\n');
              break;
            case 'li':
              result.push('- ');
              break;
            case 'code':
            case 'pre':
              result.push('`');
              break;
            case 'ul':
              // Ignore
              break;
            default:
              throw new Error(`Unknown tag "${tag}".`);
          }
        },
        onclosetag: (tag: string) => {
          switch (tag) {
            case 'a':
              result.push('}');
              break;
            case 'em':
            case 'i':
              result.push('_');
              break;
            case 'strong':
            case 'b':
              result.push('__');
              break;
            case 'li':
              result.push('\n');
              break;
            case 'code':
            case 'pre':
              result.push('`');
              break;
            case 'ul':
            case 'br':
              // Ignore
              break;
            default:
              throw new Error(`Unknown tag "${tag}".`);
          }
        }
      } as unknown as DomHandler);
  parser.write(comment);
  parser.end();

  const lines = (result.join('')).split('\n');
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  // Hack to get JSDOCs working. Microsoft does not expose JSDOC-creation API.
  return lines.length === 1 ? `* ${lines[0]} ` :
                              ('*\n * ' + lines.join('\n * ') + '\n ');
}

export function withComments<T extends Node>(
    comment: string|undefined, node: T): T {
  if (!comment) return node;

  return setSyntheticLeadingComments(node, [{
                                       text: parseComment(comment),
                                       kind: SyntaxKind.MultiLineCommentTrivia,
                                       hasTrailingNewLine: true,
                                       pos: -1,
                                       end: -1,
                                     }]);
}
