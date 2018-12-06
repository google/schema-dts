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

import {Rdfs, SchemaString, UrlNode} from '../../src/triples/types';

describe('UrlNode', () => {
  it('parses rdf-syntax', () => {
    const node =
        UrlNode.Parse('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

    expect(node.name).toBe('type');
    expect(node.context.href)
        .toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns');
    expect(node.context.hostname).toBe('www.w3.org');
    expect(node.context.path).toEqual(['1999', '02', '22-rdf-syntax-ns']);
  });

  it('parses rdf-schema', () => {
    const node = UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class');

    expect(node.name).toBe('Class');
    expect(node.context.href).toBe('http://www.w3.org/2000/01/rdf-schema');
    expect(node.context.hostname).toBe('www.w3.org');
    expect(node.context.path).toEqual(['2000', '01', 'rdf-schema']);
  });

  it('parses schema.org concepts', () => {
    const node = UrlNode.Parse('http://schema.org/domainIncludes');

    expect(node.name).toBe('domainIncludes');
    expect(node.context.href).toBe('http://schema.org/');
    expect(node.context.hostname).toBe('schema.org');
    expect(node.context.path).toEqual(['']);
  });
});

describe('SchemaString', () => {
  it('parses regular strings', () => {
    const node = SchemaString.Parse('"foo"');
    expect(node).toBeDefined();
    expect(node!.language).toBeUndefined();
    expect(node!.value).toEqual('foo');
  });

  it('parses regular strings with escaped quotes', () => {
    const node = SchemaString.Parse('"fo\\"o\\""');
    expect(node).toBeDefined();
    expect(node!.language).toBeUndefined();
    expect(node!.value).toEqual('fo"o"');
  });

  it('parses strings with language', () => {
    const node = SchemaString.Parse('"bar"@en');
    expect(node).toBeDefined();
    expect(node!.language).toEqual('en');
    expect(node!.value).toEqual('bar');
  });

  it('returns null when parsing invalid strings', () => {
    expect(SchemaString.Parse('"foo')).toBeNull();
    expect(SchemaString.Parse('foo"')).toBeNull();
    expect(SchemaString.Parse('foo"@en')).toBeNull();
    expect(SchemaString.Parse('"foo"@')).toBeNull();
    expect(SchemaString.Parse('"fo"o"')).toBeNull();
    expect(SchemaString.Parse('"fo"o"@en')).toBeNull();
  });
});

describe('Rdfs', () => {
  it('parses valid nodes', () => {
    expect(Rdfs.Parse('rdfs:foo')).toBeDefined();
    expect(Rdfs.Parse('rdfs:bar')!.label).toEqual('bar');
  });

  it('returns null when attempting to parse invalid nodes', () => {
    expect(Rdfs.Parse('rdfs:')).toBeNull();
    expect(Rdfs.Parse('rdf:foo')).toBeNull();
  });
});
