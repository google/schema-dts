/**
 * Copyright 2023 Google LLC
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
import type {TypeNode} from 'typescript';
const {factory, SyntaxKind} = ts;

export function typeUnion(
  ...args: Array<TypeNode | undefined | null | false>
): TypeNode {
  const types = args.filter((elem): elem is TypeNode => !!elem);

  switch (types.length) {
    case 0:
      return factory.createKeywordTypeNode(SyntaxKind.NeverKeyword);
    case 1:
      return types[0];
    default:
      return factory.createUnionTypeNode(types);
  }
}
