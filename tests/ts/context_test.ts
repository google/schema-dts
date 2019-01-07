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
import 'jasmine';

import {createPrinter, createSourceFile, EmitHint, NewLineKind, Node, ScriptKind, ScriptTarget} from 'typescript';

import {UrlNode} from '../../src/triples/types';
import {Context} from '../../src/ts/context';

function asString(node: Node): string {
  const printer = createPrinter({newLine: NewLineKind.LineFeed});
  const source = createSourceFile(
      'test.ts', '', ScriptTarget.Latest, /*setParentNodes=*/false,
      ScriptKind.TS);
  return printer.printNode(EmitHint.Unspecified, node, source);
}

describe('WithContext generation', () => {
  it('with one item', () => {
    const ctx = new Context();
    ctx.setUrlContext('https://foo.com');

    expect(asString(ctx.toNode()))
        .toEqual(
            `/** Used at the top-level node to indicate the context for the JSON-LD objects used. The context provided in this type is compatible with the keys and URLs in the rest of this generated file. */
export type WithContext<T extends Thing> = T & {
    "@context": "https://foo.com";
};`);
  });

  it('with named items', () => {
    const ctx = new Context();
    ctx.addNamedContext('a', 'https://foo.com');
    ctx.addNamedContext('b', 'https://bar.com');

    expect(asString(ctx.toNode()))
        .toEqual(
            `/** Used at the top-level node to indicate the context for the JSON-LD objects used. The context provided in this type is compatible with the keys and URLs in the rest of this generated file. */
export type WithContext<T extends Thing> = T & {
    "@context": {
        "a": "https://foo.com";
        "b": "https://bar.com";
    };
};`);
  });
});

describe('Context.validate', () => {
  it('empty throws', () => {
    expect(() => {
      const ctx = new Context();
      ctx.validate();
    }).toThrowError('Invalid empty context.');
  });

  it('duplicate throws', () => {
    expect(() => {
      const ctx = new Context();
      ctx.addNamedContext('a', 'foo.com');
      ctx.addNamedContext('a', 'bar.com');
      ctx.validate();
    }).toThrowError('Named context a found twice in context.');
  });

  it('empty name throws', () => {
    expect(() => {
      const ctx = new Context();
      ctx.addNamedContext('a', 'foo.com');
      ctx.addNamedContext('', 'bar.com');
      ctx.validate();
    })
        .toThrowError(
            'Context with multipled named contexts includes unnamed URL.');
  });
});

describe('Context.getScopedName', () => {
  it('with single domain URL (https)', () => {
    const ctx = new Context();
    ctx.setUrlContext('https://schema.org');

    expect(ctx.getScopedName(UrlNode.Parse('https://schema.org/Thing')))
        .toEqual('Thing');
    expect(ctx.getScopedName(UrlNode.Parse('https://schema.org/rangeIncludes')))
        .toEqual('rangeIncludes');
    expect(ctx.getScopedName(UrlNode.Parse('http://schema.org/Door')))
        .toEqual('Door');
    expect(ctx.getScopedName(UrlNode.Parse('https://foo.org/Door')))
        .toEqual('https://foo.org/Door');
  });

  it('with single domain URL (http)', () => {
    const ctx = new Context();
    ctx.setUrlContext('http://schema.org');

    expect(ctx.getScopedName(UrlNode.Parse('http://schema.org/Thing')))
        .toEqual('Thing');
    expect(ctx.getScopedName(UrlNode.Parse('http://schema.org/rangeIncludes')))
        .toEqual('rangeIncludes');
    expect(ctx.getScopedName(UrlNode.Parse('https://schema.org/Door')))
        .toEqual('https://schema.org/Door');
    expect(ctx.getScopedName(UrlNode.Parse('http://foo.org/Door')))
        .toEqual('http://foo.org/Door');
  });

  it('with multiple URLs', () => {
    const ctx = new Context();
    ctx.addNamedContext('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
    ctx.addNamedContext('rdfs', 'http://www.w3.org/2000/01/rdf-schema#');
    ctx.addNamedContext('schema', 'http://schema.org/');

    expect(ctx.getScopedName(UrlNode.Parse('http://schema.org/Thing')))
        .toEqual('schema:Thing');
    expect(ctx.getScopedName(UrlNode.Parse(
               'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')))
        .toEqual('rdf:type');
    expect(ctx.getScopedName(UrlNode.Parse(
               'http://www.w3.org/2000/01/rdf-schema#subClassOf')))
        .toEqual('rdfs:subClassOf');
    expect(ctx.getScopedName(UrlNode.Parse('http://foo.org/Door')))
        .toEqual('http://foo.org/Door');
  });
});
