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

import {expect} from 'chai';
import {createExpressionWithTypeArguments, createPrinter, createSourceFile, EmitHint, NewLineKind, ScriptKind, ScriptTarget} from 'typescript';

import {SchemaString, UrlNode} from '../../src/triples/types';
import {BooleanEnum, Builtin, Class, DataTypeUnion, Sort} from '../../src/ts/class';
import {Context} from '../../src/ts/context';
import {makeClass, makeClassMap} from '../helpers/make_class';

describe('Class', () => {
  let cls: Class;
  beforeEach(() => {
    cls = makeClass('https://schema.org/Person');
  });

  it('not deprecated by default', () => {
    expect(cls.deprecated).to.be.false;
  });

  describe('add errors', () => {
    it('add parent with missing class', () => {
      expect(
          () => cls.add(
              {
                Predicate: subClassOf(),
                Object: UrlNode.Parse('https://schema.org/Thing')
              },
              makeClassMap(cls)))
          .to.throw('Couldn\'t find parent');
    });

    it('add parent with missing class', () => {
      expect(
          () => cls.add(
              {
                Predicate: supersededBy(),
                Object: UrlNode.Parse('https://schema.org/CoolPerson')
              },
              makeClassMap(cls)))
          .to.throw('Couldn\'t find class https://schema.org/CoolPerson');
    });
  });

  describe('toNode', () => {
    it('by default (no parent)', () => {
      // A class with no parent has a top-level "@id"
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      expect(asString(cls, ctx))
          .to.equal(
              'type PersonBase = {\n' +
              '    /** IRI identifying the canonical address of this object. */\n' +
              '    "@id"?: string;\n' +
              '};\n' +
              'export type Person = {\n' +
              '    "@type": "Person";\n' +
              '} & PersonBase;');
    });

    it('empty (with parent)', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      expect(asString(cls, ctx))
          .to.equal(
              'type PersonBase = ThingBase;\n' +
              'export type Person = {\n' +
              '    "@type": "Person";\n' +
              '} & PersonBase;');
    });

    it('deprecated once (only)', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      expect(cls.add(
                 {
                   Predicate: supersededBy(),
                   Object: UrlNode.Parse('https://schema.org/CoolPerson')
                 },
                 makeClassMap(cls, makeClass('https://schema.org/CoolPerson'))))
          .to.be.true;

      expect(asString(cls, ctx))
          .to.equal(
              'type PersonBase = ThingBase;\n' +
              '/** @deprecated Use CoolPerson instead. */\n' +
              'export type Person = {\n' +
              '    "@type": "Person";\n' +
              '} & PersonBase;');
    });

    it('deprecated twice (alphabetical)', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      const map = makeClassMap(
          cls, makeClass('https://schema.org/CoolPerson'),
          makeClass('https://schema.org/APerson'));

      expect(cls.add(
                 {
                   Predicate: supersededBy(),
                   Object: UrlNode.Parse('https://schema.org/CoolPerson')
                 },
                 map))
          .to.be.true;

      expect(cls.add(
                 {
                   Predicate: supersededBy(),
                   Object: UrlNode.Parse('https://schema.org/APerson')
                 },
                 map))
          .to.be.true;

      expect(asString(cls, ctx))
          .to.equal(
              'type PersonBase = ThingBase;\n' +
              '/** @deprecated Use APerson or CoolPerson instead. */\n' +
              'export type Person = {\n' +
              '    "@type": "Person";\n' +
              '} & PersonBase;');
    });

    it('deprecated with comment', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      expect(cls.add(
                 {
                   Predicate: supersededBy(),
                   Object: UrlNode.Parse('https://schema.org/CoolPerson')
                 },
                 makeClassMap(cls, makeClass('https://schema.org/CoolPerson'))))
          .to.be.true;
      expect(cls.add(
                 {
                   Predicate: comment(),
                   Object: new SchemaString('Fantastic', 'en')
                 },
                 new Map))
          .to.be.true;

      expect(asString(cls, ctx))
          .to.equal(
              'type PersonBase = ThingBase;\n' +
              '/**\n' +
              ' * Fantastic\n' +
              ' * @deprecated Use CoolPerson instead.\n' +
              ' */\n' +
              'export type Person = {\n' +
              '    "@type": "Person";\n' +
              '} & PersonBase;');
    });

    it('complains about bad comment markup', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      expect(cls.add(
                 {
                   Predicate: comment(),
                   Object: new SchemaString(
                       'Hello World. ' +
                           '<table>' +
                           '<tr><td>XYZ</td><td>ABC</td></tr>' +
                           '<tr><td>123</td><td>234</td></tr>' +
                           '</table>',
                       undefined)
                 },
                 new Map))
          .to.be.true;

      expect(() => cls.toNode(ctx, true)).to.throw('Unknown tag');
    });
  });
});

describe('Sort(Class, Class)', () => {
  describe('Two regulars', () => {
    it('By name', () => {
      expect(Sort(
                 makeClass('https://schema.org/A'),
                 makeClass('https://schema.org/B')))
          .to.equal(-1);
      expect(Sort(
                 makeClass('https://schema.org/B'),
                 makeClass('https://schema.org/A')))
          .to.equal(+1);
      expect(Sort(
                 makeClass('https://schema.org/A'),
                 makeClass('https://schema.org/A')))
          .to.equal(0);

      expect(Sort(
                 makeClass('https://schema.org/A'),
                 makeClass('https://foo.bar/B')))
          .to.equal(-1);
      expect(Sort(
                 makeClass('https://schema.org/B'),
                 makeClass('https://foo.bar/A')))
          .to.equal(+1);

      expect(Sort(
                 makeClass('https://schema.org/Z'),
                 makeClass('https://schema.org/Z#A')))
          .to.equal(+1);
    });

    it('Same name different URL', () => {
      expect(Sort(
                 makeClass('https://schema.org/A'),
                 makeClass('https://foo.bar/A')))
          .to.equal(+1);
      expect(Sort(
                 makeClass('https://schema.org/A'),
                 makeClass('https://z.org/2010#A')))
          .to.equal(-1);
      expect(Sort(
                 makeClass('https://schema.org/A'),
                 makeClass('https://schema.org/Z#A')))
          .to.equal(-1);
    });


    it('DataType comes first', () => {
      // Before regular classes.
      expect(Sort(
                 new Builtin('https://schema.org/Text', 'string', ''),
                 makeClass('https://schema.org/A')))
          .to.equal(-1);
      expect(Sort(
                 makeClass('https://schema.org/A'),
                 new Builtin('https://schema.org/Text', 'string', '')))
          .to.equal(+1);

      // Before regular classes with different domains.
      expect(Sort(
                 new Builtin('https://schema.org/Text', 'string', ''),
                 makeClass('https://a.org/DataType')))
          .to.equal(-1);
      expect(Sort(
                 makeClass('https://a.org/DataType'),
                 new Builtin('https://schema.org/Text', 'string', '')))
          .to.equal(+1);

      // Before builtins.
      expect(Sort(
                 new DataTypeUnion('https://schema.org/DataType', [], ''),
                 new Builtin('https://schema.org/A', 'string', '')))
          .to.equal(+1);
      expect(Sort(
                 new Builtin('https://schema.org/A', 'string', ''),
                 new DataTypeUnion('https://schema.org/DataType', [], '')))
          .to.equal(-1);
      expect(Sort(
                 new Builtin('https://schema.org/Z', 'string', ''),
                 new DataTypeUnion('https://schema.org/DataType', [], '')))
          .to.equal(-1);

      // Can be same as more specific builtins.
      expect(Sort(
                 new BooleanEnum(
                     'https://schema.org/Boo', 'https://schema.org/B',
                     'https://schema.org/C', ''),
                 new Builtin('https://schema.org/Boo', 'Text', '')))
          .to.equal(0);

      // Sorts within Builtins
      expect(Sort(
                 new Builtin('https://schema.org/A', 'string', ''),
                 new Builtin('https://schema.org/B', 'string', '')))
          .to.equal(-1);
      expect(Sort(
                 new Builtin('https://schema.org/A', 'string', ''),
                 new BooleanEnum(
                     'https://schema.org/B', 'https://schema.org/B',
                     'https://schema.org/C', '')))
          .to.equal(-1);

      expect(Sort(
                 new Builtin('https://schema.org/B', 'string', ''),
                 new Builtin('https://schema.org/A', 'string', '')))
          .to.equal(+1);
      expect(Sort(
                 new Builtin('https://schema.org/B', 'string', ''),
                 new BooleanEnum(
                     'https://schema.org/A', 'https://schema.org/B',
                     'https://schema.org/C', '')))
          .to.equal(+1);

      expect(Sort(
                 new Builtin('https://schema.org/C', 'string', ''),
                 new Builtin('https://schema.org/C', 'string', '')))
          .to.equal(0);

      expect(Sort(
                 new Builtin('https://schema.org/A#Z', 'string', ''),
                 new Builtin('https://schema.org/C', 'string', '')))
          .to.equal(+1);
      expect(Sort(
                 new Builtin('https://z.org/C', 'string', ''),
                 new Builtin('https://schema.org/C', 'string', '')))
          .to.equal(+1);
      expect(Sort(
                 new Builtin('https://z.org/Z#A', 'string', ''),
                 new Builtin('https://schema.org/C', 'string', '')))
          .to.equal(-1);
    });

    it('DataType union comes next', () => {
      // Before regular classes.
      expect(Sort(
                 new DataTypeUnion('https://schema.org/DataType', [], ''),
                 makeClass('https://schema.org/A')))
          .to.equal(-1);
      expect(Sort(
                 makeClass('https://schema.org/A'),
                 new DataTypeUnion('https://schema.org/DataType', [], '')))
          .to.equal(+1);

      // Before regular classes with different domains.
      expect(Sort(
                 new DataTypeUnion('https://schema.org/DataType', [], ''),
                 makeClass('https://a.org/DataType')))
          .to.equal(-1);
      expect(Sort(
                 makeClass('https://a.org/DataType'),
                 new DataTypeUnion('https://schema.org/DataType', [], '')))
          .to.equal(+1);

      // After specific builtins.
      expect(Sort(
                 new BooleanEnum(
                     'https://schema.org/A', 'https://schema.org/B',
                     'https://schema.org/C', ''),
                 new DataTypeUnion('https://schema.org/DataType', [], '')))
          .to.equal(-1);
    });

    it('DataType union is equal', () => {
      expect(Sort(
                 new DataTypeUnion('https://schema.org/DataType', [], ''),
                 new DataTypeUnion('https://schema.org/DataType', [], '')))
          .to.equal(0);

      expect(Sort(
                 new DataTypeUnion('https://schema.org/A', [], ''),
                 new DataTypeUnion('https://schema.org/Z', [], '')))
          .to.equal(0);

      expect(Sort(
                 new DataTypeUnion('https://schema.org/Z', [], ''),
                 new DataTypeUnion('https://schema.org/A', [], '')))
          .to.equal(0);
    });
  });
});

function asString(
    cls: Class, context: Context,
    {skipDeprecated}: {skipDeprecated?: boolean} = {}): string {
  const source = createSourceFile(
      'result.ts', '', ScriptTarget.ES2015, /*setParentNodes=*/ false,
      ScriptKind.TS);
  const printer = createPrinter({newLine: NewLineKind.LineFeed});

  return cls.toNode(context, !!skipDeprecated)
      .map(node => printer.printNode(EmitHint.Unspecified, node, source))
      .join('\n');
}

function subClassOf(): UrlNode {
  return UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#subClassOf');
}

function supersededBy(): UrlNode {
  return UrlNode.Parse('https://schema.org/supersededBy');
}

function comment(): UrlNode {
  return UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#comment');
}

function addParent(cls: Class, parentUrl: string): void {
  expect(cls.add(
             {Predicate: subClassOf(), Object: UrlNode.Parse(parentUrl)},
             makeClassMap(cls, makeClass(parentUrl))))
      .to.be.true;
}