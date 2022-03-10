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

import {Literal, NamedNode, Quad} from 'n3';
import ts from 'typescript';

import {
  AliasBuiltin,
  Class,
  DataTypeUnion,
  Sort,
  Builtin,
} from '../../src/ts/class.js';
import {Context} from '../../src/ts/context.js';
import {makeClass, makeClassMap, makeProperty} from '../helpers/make_class.js';

describe('Class', () => {
  let cls: Class;
  beforeEach(() => {
    cls = makeClass('https://schema.org/Person');
  });

  it('not deprecated by default', () => {
    expect(cls.deprecated).toBe(false);
  });

  describe('add errors', () => {
    it('add parent with missing class', () => {
      expect(() =>
        cls.add(
          new Quad(
            null!,
            subClassOf(),
            new NamedNode('https://schema.org/Thing')
          ),
          makeClassMap(cls)
        )
      ).toThrowError("Couldn't find parent");
    });

    it('add parent with missing class', () => {
      expect(() =>
        cls.add(
          new Quad(
            null!,
            supersededBy(),
            new NamedNode('https://schema.org/CoolPerson')
          ),
          makeClassMap(cls)
        )
      ).toThrowError("Couldn't find class https://schema.org/CoolPerson");
    });
  });

  describe('toNode', () => {
    it('by default (no parent)', () => {
      // A class with no parent has a top-level "@id"
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
        "interface PersonBase extends Partial<IdReference> {
        }
        interface PersonLeaf extends PersonBase {
            \\"@type\\": \\"Person\\";
        }
        export type Person = PersonLeaf;"
      `);
    });

    it('empty (with parent)', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
        "interface PersonLeaf extends ThingBase {
            \\"@type\\": \\"Person\\";
        }
        export type Person = PersonLeaf;"
      `);
    });

    it('empty (two parents)', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing1');
      addParent(cls, 'https://schema.org/Thing2');

      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
        "interface PersonBase extends Thing1Base, Thing2Base {
        }
        interface PersonLeaf extends PersonBase {
            \\"@type\\": \\"Person\\";
        }
        export type Person = PersonLeaf;"
      `);
    });

    it('deprecated once (only)', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      expect(
        cls.add(
          new Quad(
            null!,
            supersededBy(),
            new NamedNode('https://schema.org/CoolPerson')
          ),
          makeClassMap(cls, makeClass('https://schema.org/CoolPerson'))
        )
      ).toBe(true);

      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
        "interface PersonLeaf extends ThingBase {
            \\"@type\\": \\"Person\\";
        }
        /** @deprecated Use CoolPerson instead. */
        export type Person = PersonLeaf;"
      `);
    });

    it('deprecated twice (alphabetical)', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      const map = makeClassMap(
        cls,
        makeClass('https://schema.org/CoolPerson'),
        makeClass('https://schema.org/APerson')
      );

      expect(
        cls.add(
          new Quad(
            null!,
            supersededBy(),
            new NamedNode('https://schema.org/CoolPerson')
          ),
          map
        )
      ).toBe(true);

      expect(
        cls.add(
          new Quad(
            null!,
            supersededBy(),
            new NamedNode('https://schema.org/APerson')
          ),
          map
        )
      ).toBe(true);

      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
        "interface PersonLeaf extends ThingBase {
            \\"@type\\": \\"Person\\";
        }
        /** @deprecated Use APerson or CoolPerson instead. */
        export type Person = PersonLeaf;"
      `);
    });

    it('deprecated with comment', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      expect(
        cls.add(
          new Quad(
            null!,
            supersededBy(),
            new NamedNode('https://schema.org/CoolPerson')
          ),
          makeClassMap(cls, makeClass('https://schema.org/CoolPerson'))
        )
      ).toBe(true);
      expect(
        cls.add(
          new Quad(null!, comment(), new Literal('"Fantastic"')),
          new Map()
        )
      ).toBe(true);

      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
        "interface PersonLeaf extends ThingBase {
            \\"@type\\": \\"Person\\";
        }
        /**
         * Fantastic
         *
         * @deprecated Use CoolPerson instead.
         */
        export type Person = PersonLeaf;"
      `);
    });

    it('complains about bad comment markup', () => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org/');
      addParent(cls, 'https://schema.org/Thing');

      expect(
        cls.add(
          new Quad(
            null!,
            comment(),
            new Literal(
              '"Hello World. ' +
                '<table>' +
                '<tr><td>XYZ</td><td>ABC</td></tr>' +
                '<tr><td>123</td><td>234</td></tr>' +
                '</table>"'
            )
          ),
          new Map()
        )
      ).toBe(true);

      expect(() =>
        cls.toNode(ctx, {skipDeprecatedProperties: true, hasRole: false})
      ).toThrowError('unknown node type');
    });
  });

  describe('property sorting', () => {
    const ctx = new Context();
    ctx.addNamedContext('schema', 'https://schema.org/');

    it('alphabetic, respecting empty', () => {
      const cls = makeClass('https://schema.org/A');
      cls.addProp(makeProperty('https://schema.org/a'));
      cls.addProp(makeProperty('https://schema.org/b'));
      cls.addProp(makeProperty('https://schema.org/'));
      cls.addProp(makeProperty('https://schema.org/c'));
      cls.addProp(makeProperty('https://abc.com/e'));
      cls.addProp(makeProperty('https://abc.com'));

      expect(asString(cls, ctx)).toMatchInlineSnapshot(`
"interface ABase extends Partial<IdReference> {
    \\"https://abc.com\\"?: SchemaValue<never>;
    \\"schema:\\"?: SchemaValue<never>;
    \\"schema:a\\"?: SchemaValue<never>;
    \\"schema:b\\"?: SchemaValue<never>;
    \\"schema:c\\"?: SchemaValue<never>;
    \\"https://abc.com/e\\"?: SchemaValue<never>;
}
interface ALeaf extends ABase {
    \\"@type\\": \\"schema:A\\";
}
export type A = ALeaf;"
`);
    });
  });
});

describe('Sort(Class, Class)', () => {
  describe('Two regulars', () => {
    it('By name', () => {
      expect(
        Sort(
          makeClass('https://schema.org/A'),
          makeClass('https://schema.org/B')
        )
      ).toBe(-1);
      expect(
        Sort(
          makeClass('https://schema.org/B'),
          makeClass('https://schema.org/A')
        )
      ).toBe(+1);
      expect(
        Sort(
          makeClass('https://schema.org/A'),
          makeClass('https://schema.org/A')
        )
      ).toBe(0);

      expect(
        Sort(makeClass('https://schema.org/A'), makeClass('https://foo.bar/B'))
      ).toBe(-1);
      expect(
        Sort(makeClass('https://schema.org/B'), makeClass('https://foo.bar/A'))
      ).toBe(+1);

      expect(
        Sort(
          makeClass('https://schema.org/Z'),
          makeClass('https://schema.org/Z#A')
        )
      ).toBe(+1);
    });

    it('Same name different URL', () => {
      expect(
        Sort(makeClass('https://schema.org/A'), makeClass('https://foo.bar/A'))
      ).toBe(+1);
      expect(
        Sort(
          makeClass('https://schema.org/A'),
          makeClass('https://z.org/2010#A')
        )
      ).toBe(-1);
      expect(
        Sort(
          makeClass('https://schema.org/A'),
          makeClass('https://schema.org/Z#A')
        )
      ).toBe(-1);
    });

    it('DataType comes first', () => {
      // Before regular classes.
      expect(
        Sort(
          new AliasBuiltin(
            new NamedNode('https://schema.org/Text'),
            AliasBuiltin.Alias('string')
          ),
          makeClass('https://schema.org/A')
        )
      ).toBe(-1);
      expect(
        Sort(
          makeClass('https://schema.org/A'),
          new AliasBuiltin(
            new NamedNode('https://schema.org/Text'),
            AliasBuiltin.Alias('string')
          )
        )
      ).toBe(+1);

      // Before regular classes with different domains.
      expect(
        Sort(
          new AliasBuiltin(
            new NamedNode('https://schema.org/Text'),
            AliasBuiltin.Alias('string')
          ),
          makeClass('https://a.org/DataType')
        )
      ).toBe(-1);
      expect(
        Sort(
          makeClass('https://a.org/DataType'),
          new AliasBuiltin(
            new NamedNode('https://schema.org/Text'),
            AliasBuiltin.Alias('string')
          )
        )
      ).toBe(+1);

      // Before builtins.
      expect(
        Sort(
          new DataTypeUnion(new NamedNode('https://schema.org/DataType'), []),
          new AliasBuiltin(
            new NamedNode('https://schema.org/A'),
            AliasBuiltin.Alias('string')
          )
        )
      ).toBe(+1);
      expect(
        Sort(
          new AliasBuiltin(
            new NamedNode('https://schema.org/A'),
            AliasBuiltin.Alias('string')
          ),
          new DataTypeUnion(new NamedNode('https://schema.org/DataType'), [])
        )
      ).toBe(-1);
      expect(
        Sort(
          new AliasBuiltin(
            new NamedNode('https://schema.org/Z'),
            AliasBuiltin.Alias('string')
          ),
          new DataTypeUnion(new NamedNode('https://schema.org/DataType'), [])
        )
      ).toBe(-1);

      // Can be same as less specific builtins.
      expect(
        Sort(
          new Builtin(new NamedNode('https://schema.org/Boo')),
          new AliasBuiltin(
            new NamedNode('https://schema.org/Boo'),
            AliasBuiltin.Alias('Text')
          )
        )
      ).toBe(0);

      // Sorts within Builtins
      expect(
        Sort(
          new AliasBuiltin(
            new NamedNode('https://schema.org/A'),
            AliasBuiltin.Alias('string')
          ),
          new AliasBuiltin(
            new NamedNode('https://schema.org/B'),
            AliasBuiltin.Alias('string')
          )
        )
      ).toBe(-1);

      expect(
        Sort(
          new AliasBuiltin(
            new NamedNode('https://schema.org/B'),
            AliasBuiltin.Alias('string')
          ),
          new AliasBuiltin(
            new NamedNode('https://schema.org/A'),
            AliasBuiltin.Alias('string')
          )
        )
      ).toBe(+1);

      expect(
        Sort(
          new AliasBuiltin(
            new NamedNode('https://schema.org/C'),
            AliasBuiltin.Alias('string')
          ),
          new AliasBuiltin(
            new NamedNode('https://schema.org/C'),
            AliasBuiltin.Alias('string')
          )
        )
      ).toBe(0);

      expect(
        Sort(
          new AliasBuiltin(
            new NamedNode('https://schema.org/A#Z'),
            AliasBuiltin.Alias('string')
          ),
          new AliasBuiltin(
            new NamedNode('https://schema.org/C'),
            AliasBuiltin.Alias('string')
          )
        )
      ).toBe(+1);
      expect(
        Sort(
          new AliasBuiltin(
            new NamedNode('https://z.org/C'),
            AliasBuiltin.Alias('string')
          ),
          new AliasBuiltin(
            new NamedNode('https://schema.org/C'),
            AliasBuiltin.Alias('string')
          )
        )
      ).toBe(+1);
      expect(
        Sort(
          new AliasBuiltin(
            new NamedNode('https://z.org/Z#A'),
            AliasBuiltin.Alias('string')
          ),
          new AliasBuiltin(
            new NamedNode('https://schema.org/C'),
            AliasBuiltin.Alias('string')
          )
        )
      ).toBe(-1);
    });

    it('DataType union comes next', () => {
      // Before regular classes.
      expect(
        Sort(
          new DataTypeUnion(new NamedNode('https://schema.org/DataType'), []),
          makeClass('https://schema.org/A')
        )
      ).toBe(-1);
      expect(
        Sort(
          makeClass('https://schema.org/A'),
          new DataTypeUnion(new NamedNode('https://schema.org/DataType'), [])
        )
      ).toBe(+1);

      // Before regular classes with different domains.
      expect(
        Sort(
          new DataTypeUnion(new NamedNode('https://schema.org/DataType'), []),
          makeClass('https://a.org/DataType')
        )
      ).toBe(-1);
      expect(
        Sort(
          makeClass('https://a.org/DataType'),
          new DataTypeUnion(new NamedNode('https://schema.org/DataType'), [])
        )
      ).toBe(+1);
    });

    it('DataType union is equal', () => {
      expect(
        Sort(
          new DataTypeUnion(new NamedNode('https://schema.org/DataType'), []),
          new DataTypeUnion(new NamedNode('https://schema.org/DataType'), [])
        )
      ).toBe(0);

      expect(
        Sort(
          new DataTypeUnion(new NamedNode('https://schema.org/A'), []),
          new DataTypeUnion(new NamedNode('https://schema.org/Z'), [])
        )
      ).toBe(0);

      expect(
        Sort(
          new DataTypeUnion(new NamedNode('https://schema.org/Z'), []),
          new DataTypeUnion(new NamedNode('https://schema.org/A'), [])
        )
      ).toBe(0);
    });
  });
});

function asString(
  cls: Class,
  context: Context,
  {skipDeprecated}: {skipDeprecated?: boolean} = {}
): string {
  const source = ts.createSourceFile(
    'result.ts',
    '',
    ts.ScriptTarget.ES2015,
    /*setParentNodes=*/ false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});

  return cls
    .toNode(context, {
      skipDeprecatedProperties: !!skipDeprecated,
      hasRole: false,
    })
    .map(node => printer.printNode(ts.EmitHint.Unspecified, node, source))
    .join('\n');
}

function subClassOf() {
  return new NamedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf');
}

function supersededBy() {
  return new NamedNode('https://schema.org/supersededBy');
}

function comment() {
  return new NamedNode('http://www.w3.org/2000/01/rdf-schema#comment');
}

function addParent(cls: Class, parentUrl: string): void {
  expect(
    cls.add(
      new Quad(null!, subClassOf(), new NamedNode(parentUrl)),
      makeClassMap(cls, makeClass(parentUrl))
    )
  ).toBe(true);
}
