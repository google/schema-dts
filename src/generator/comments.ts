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

import {Node, setSyntheticLeadingComments, SyntaxKind, SynthesizedComment} from 'typescript';

export function withComments<T extends Node>(
    comment: string|undefined, node: T): T {
  if (!comment) return node;

  return setSyntheticLeadingComments(
      node,
      [{
        text: `* ${comment} `,  // Hack to get JSDOCs working. Microsoft does
                                // not expose JSDOC-creation API.
        kind: SyntaxKind.MultiLineCommentTrivia,
        hasTrailingNewLine: true,
        pos: -1,
        end: -1,
      }]);
}
