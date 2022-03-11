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
import type {PropertySignature} from 'typescript';
const {factory} = ts;

import {NamedNode} from 'n3';
import {nameFromContext} from '../triples/term_utils.js';

export class Context {
  private readonly context: Array<readonly [string, string]> = [];

  setUrlContext(ctx: string) {
    if (this.context.length > 0) {
      throw new Error(
        'Attempting to set a default URL context, ' +
          'but other named contexts exist already.'
      );
    }
    this.context.push(['', ctx]);
  }
  addNamedContext(name: string, url: string) {
    this.context.push([name, url]);
  }
  validate() {
    if (this.context.length === 0) throw new Error('Invalid empty context.');
    if (this.context.length === 1) return; // One context is always right.

    // Make sure no key is duplicated.
    const seen: Set<string> = new Set<string>();
    for (const [name] of this.context) {
      if (seen.has(name)) {
        throw new Error(`Named context ${name} found twice in context.`);
      }
      if (name === '') {
        throw new Error(
          'Context with multiple named contexts includes unnamed URL.'
        );
      }
      seen.add(name);
    }
  }

  getScopedName(node: NamedNode): string {
    for (const [ctxName, url] of this.context) {
      const name = nameFromContext(node, url);
      if (name !== null) {
        // Valid possibilities:
        // - "schema:Foo"  when name == schema && node.name == Foo.
        // - "schema:"     when name == schema && node.name is undefined.
        // - "Foo"         when name is empty and node.name is Foo.
        //
        // Don't allow "" when name is empty and  node.name is undefined.
        return ctxName === '' ? name || node.id : `${ctxName}:${name}`;
      }
    }
    return node.id;
  }

  private typeNode() {
    // Either:
    // "@context": "https://schema.org" or similar:
    if (this.context.length === 1 && this.context[0][0] === '') {
      return factory.createLiteralTypeNode(
        factory.createStringLiteral(this.context[0][1])
      );
    }

    // or "@context" is a literal object type of key-values of URLs:
    return factory.createTypeLiteralNode(
      /*members=*/ this.context.map(([name, url]) =>
        factory.createPropertySignature(
          /*modifiers=*/ [],
          factory.createStringLiteral(name),
          /*questionToken=*/ undefined,
          factory.createLiteralTypeNode(factory.createStringLiteral(url))
        )
      )
    );
  }

  /** Creates the full property signature for "@context" given the configured context. */
  contextProperty(): PropertySignature {
    return factory.createPropertySignature(
      /*modifiers=*/ [],
      factory.createStringLiteral('@context'),
      /*questionToken=*/ undefined,
      this.typeNode()
    );
  }

  static Parse(contextSpec: string): Context {
    const keyVals = contextSpec
      .split(',')
      .map(s => s.trim())
      .filter(s => !!s);
    const context = new Context();

    if (keyVals.length === 1) {
      context.setUrlContext(keyVals[0]);
    } else {
      for (const keyVal of keyVals) {
        const match = /^([^:]+):((http|https):.+)$/g.exec(keyVal);
        if (!match || match[1] === undefined || match[2] === undefined) {
          throw new Error(`Unknown value ${keyVal} in --context flag.`);
        }
        context.addNamedContext(match[1], match[2]);
      }
    }

    context.validate();
    return context;
  }
}
