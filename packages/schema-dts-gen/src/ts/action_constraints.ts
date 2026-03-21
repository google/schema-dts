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

import ts, {factory, ModifierFlags, SyntaxKind} from 'typescript';
import {arrayOf} from './util/arrayof.js';
import {withComments} from './util/comments.js';

const ActionBaseName = 'ActionBase';
const InputActionConstraintsName = 'InputActionConstraints';
const OutputActionConstraintsName = 'OutputActionConstraints';

function createIOActionConstraints(
  suffix: 'input' | 'output',
): ts.TypeAliasDeclaration {
  const name =
    suffix === 'input'
      ? InputActionConstraintsName
      : OutputActionConstraintsName;
  return factory.createTypeAliasDeclaration(
    undefined,
    name,
    arrayOf(
      factory.createTypeParameterDeclaration(
        [],
        'T',
        factory.createTypeReferenceNode(ActionBaseName),
      ),
    ),
    factory.createTypeReferenceNode('Partial', [
      factory.createMappedTypeNode(
        undefined,
        factory.createTypeParameterDeclaration(
          undefined,
          'K',
          factory.createTypeReferenceNode('Exclude', [
            factory.createTypeOperatorNode(
              SyntaxKind.KeyOfKeyword,
              factory.createTypeReferenceNode('T'),
            ),
            factory.createTemplateLiteralType(factory.createTemplateHead('@'), [
              factory.createTemplateLiteralTypeSpan(
                factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
                factory.createTemplateTail(''),
              ),
            ]),
          ]),
        ),
        factory.createTemplateLiteralType(factory.createTemplateHead(''), [
          factory.createTemplateLiteralTypeSpan(
            factory.createIntersectionTypeNode([
              factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
              factory.createTypeReferenceNode('K'),
            ]),
            factory.createTemplateTail(`-${suffix}`),
          ),
        ]),
        undefined,
        factory.createUnionTypeNode([
          factory.createTypeReferenceNode('PropertyValueSpecification'),
          factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
        ]),
        undefined,
      ),
    ]),
  );
}

export const InputActionConstraintsType = createIOActionConstraints('input');
export const OutputActionConstraintsType = createIOActionConstraints('output');
export const WithActionConstraintsType = withComments(
  'Provides input and output action constraints for an action.',
  factory.createTypeAliasDeclaration(
    factory.createModifiersFromModifierFlags(ModifierFlags.Export),
    'WithActionConstraints',
    arrayOf(
      factory.createTypeParameterDeclaration(
        [],
        'T',
        factory.createTypeReferenceNode(ActionBaseName),
      ),
    ),
    factory.createIntersectionTypeNode([
      factory.createTypeReferenceNode('T'),
      factory.createTypeReferenceNode(InputActionConstraintsName, [
        factory.createTypeReferenceNode('T'),
      ]),
      factory.createTypeReferenceNode(OutputActionConstraintsName, [
        factory.createTypeReferenceNode('T'),
      ]),
    ]),
  ),
);
