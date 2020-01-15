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

import {createIntersectionTypeNode, createLiteralTypeNode, createModifiersFromModifierFlags, createPropertySignature, createStringLiteral, createTypeAliasDeclaration, createTypeLiteralNode, createTypeParameterDeclaration, createTypeReferenceNode, ModifierFlags} from 'typescript';

import {TSubject} from '../triples/triple';

import {withComments} from './util/comments';

export class Context {
  private readonly context: Array<[string, string]> = [];

  setUrlContext(ctx: string) {
    if (this.context.length > 0) {
      throw new Error(
          'Attempting to set a default URL context, ' +
          'but other named contexts exist already.');
    }
    this.context.push(['', ctx]);
  }
  addNamedContext(name: string, url: string) {
    this.context.push([name, url]);
  }
  validate() {
    if (this.context.length === 0) throw new Error('Invalid empty context.');
    if (this.context.length === 1) return;  // One context is always right.

    // Make sure no key is duplicated.
    const seen: Set<string> = new Set<string>();
    for (const [name] of this.context) {
      if (seen.has(name)) {
        throw new Error(`Named context ${name} found twice in context.`);
      }
      if (name === '') {
        throw new Error(
            'Context with multipled named contexts includes unnamed URL.');
      }
      seen.add(name);
    }
  }

  getScopedName(node: TSubject): string {
    for (const [name, url] of this.context) {
      if (node.matchesContext(url)) {
        return name === '' ? node.name : `${name}:${node.name}`;
      }
    }
    return node.toString();
  }

  private typeNode() {
    // Either:
    // "@context": "https://schema.org" or similar:
    if (this.context.length === 1 && this.context[0][0] === '') {
      return createLiteralTypeNode(createStringLiteral(this.context[0][1]));
    }

    // or "@context" is a literal object type of key-values of URLs:
    return createTypeLiteralNode(
        /*members=*/this.context.map(
            ([name, url]) => createPropertySignature(
                /*modifiers=*/[],
                createStringLiteral(name),
                /*questionToken=*/undefined,
                createLiteralTypeNode(createStringLiteral(url)),
                /*initializer=*/undefined,
                )));
  }

  toNode() {
    // export type WithContent<T extends Thing> = T & { "@context": TYPE_NODE }
    return withComments(
        'Used at the top-level node to indicate the context for the JSON-LD ' +
            'objects used. The context provided in this type is compatible ' +
            'with the keys and URLs in the rest of this generated file.',
        createTypeAliasDeclaration(
            /*decorators=*/[],
            createModifiersFromModifierFlags(ModifierFlags.Export),
            'WithContext',
            [
              createTypeParameterDeclaration(
                  'T', /*constraint=*/
                  createTypeReferenceNode(
                      'Thing', /*typeArguments=*/undefined)),
            ],
            createIntersectionTypeNode([
              createTypeReferenceNode('T', /*typeArguments=*/undefined),
              createTypeLiteralNode([createPropertySignature(
                  /*modifiers=*/[],
                  createStringLiteral('@context'),
                  /*questionToken=*/undefined,
                  this.typeNode(),
                  /*initializer=*/undefined,
                  )]),
            ])),
    );
  }
}
