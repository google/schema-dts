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
import {expect} from 'chai';

import {Rdfs, SchemaString, UrlNode} from '../../src/triples/types';

describe('UrlNode', () => {
  it('parses rdf-syntax', () => {
    const node =
        UrlNode.Parse('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

    expect(node.name).to.equal('type');
    expect(node.context.href)
        .to.equal('http://www.w3.org/1999/02/22-rdf-syntax-ns');
    expect(node.context.hostname).to.equal('www.w3.org');
    expect(node.context.path).to.deep.equal(['1999', '02', '22-rdf-syntax-ns']);
  });

  it('parses rdf-schema', () => {
    const node = UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class');

    expect(node.name).to.equal('Class');
    expect(node.context.href).to.equal('http://www.w3.org/2000/01/rdf-schema');
    expect(node.context.hostname).to.equal('www.w3.org');
    expect(node.context.path).to.deep.equal(['2000', '01', 'rdf-schema']);
  });

  it('parses schema.org concepts', () => {
    const node = UrlNode.Parse('http://schema.org/domainIncludes');

    expect(node.name).to.equal('domainIncludes');
    expect(node.context.href).to.equal('http://schema.org/');
    expect(node.context.hostname).to.equal('schema.org');
    expect(node.context.path).to.deep.equal(['']);
  });
});

describe('SchemaString', () => {
  it('parses regular strings', () => {
    const node = SchemaString.Parse('"foo"');
    expect(node).not.to.be.undefined;
    expect(node!.language).to.be.undefined;
    expect(node!.value).to.equal('foo');
  });

  it('parses regular strings with escaped quotes', () => {
    const node = SchemaString.Parse('"fo\\"o\\""');
    expect(node).not.to.undefined;
    expect(node!.language).to.be.undefined;
    expect(node!.value).to.equal('fo"o"');
  });

  it('parses strings with language', () => {
    const node = SchemaString.Parse('"bar"@en');
    expect(node).not.to.undefined;
    expect(node!.language).to.equal('en');
    expect(node!.value).to.equal('bar');
  });

  it('returns null when parsing invalid strings', () => {
    expect(SchemaString.Parse('"foo')).to.be.null;
    expect(SchemaString.Parse('foo"')).to.be.null;
    expect(SchemaString.Parse('foo"@en')).to.be.null;
    expect(SchemaString.Parse('"foo"@')).to.be.null;
    expect(SchemaString.Parse('"fo"o"')).to.be.null;
    expect(SchemaString.Parse('"fo"o"@en')).to.be.null;
  });
});

describe('Rdfs', () => {
  it('parses valid nodes', () => {
    expect(Rdfs.Parse('rdfs:foo')).not.to.undefined;
    expect(Rdfs.Parse('rdfs:bar')!.label).to.equal('bar');
  });

  it('returns null when attempting to parse invalid nodes', () => {
    expect(Rdfs.Parse('rdfs:')).to.be.null;
    expect(Rdfs.Parse('rdf:foo')).to.be.null;
  });
});
