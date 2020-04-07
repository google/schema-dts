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

import {createPrinter, createSourceFile, EmitHint, NewLineKind, Node, ScriptKind, ScriptTarget,} from 'typescript';

import {UrlNode} from '../../src/triples/types';
import {Context} from '../../src/ts/context';

function asString(node: Node): string {
  const printer = createPrinter({newLine: NewLineKind.LineFeed});
  const source = createSourceFile(
      'test.ts', '', ScriptTarget.Latest, /*setParentNodes=*/ false,
      ScriptKind.TS);
  return printer.printNode(EmitHint.Unspecified, node, source);
}

describe('WithContext generation', () => {
  it('with one item', () => {
    const ctx = new Context();
    ctx.setUrlContext('https://foo.com');

    expect(asString(ctx.toNode()))
        .toBe(
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
        .toBe(
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
            'Context with multiple named contexts includes unnamed URL.');
  });

  it('named + default throws', () => {
    expect(() => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org');
      ctx.addNamedContext('eys', 'https://eyas.sh/foo');
      ctx.validate();
    })
        .toThrowError(
            'Context with multiple named contexts includes unnamed URL.');
  });

  it('default + name throws', () => {
    const ctx = new Context();
    ctx.addNamedContext('eys', 'https://eyas.sh/foo');
    expect(() => ctx.setUrlContext('https://schema.org'))
        .toThrowError('Attempting to set a default URL context');
  });

  it('singular works', () => {
    expect(() => {
      const ctx = new Context();
      ctx.setUrlContext('https://schema.org');
      ctx.validate();
    }).not.toThrowError();

    expect(() => {
      const ctx = new Context();
      ctx.addNamedContext('sdo', 'https://schema.org');
      ctx.validate();
    }).not.toThrowError();
  });

  it('multiple can work', () => {
    expect(() => {
      const ctx = new Context();
      ctx.addNamedContext('sdo', 'https://schema.org');
      ctx.addNamedContext('eys', 'https://eyas.sh/foo');
      ctx.validate();
    }).not.toThrowError();
  });
});

describe('Context.getScopedName', () => {
  it('with single domain URL (https)', () => {
    const ctx = new Context();
    ctx.setUrlContext('https://schema.org');

    expect(ctx.getScopedName(UrlNode.Parse('https://schema.org/Thing')))
        .toBe('Thing');
    expect(ctx.getScopedName(UrlNode.Parse('https://schema.org/rangeIncludes')))
        .toBe('rangeIncludes');
    expect(ctx.getScopedName(UrlNode.Parse('http://schema.org/Door')))
        .toBe('Door');
    expect(ctx.getScopedName(UrlNode.Parse('https://foo.org/Door')))
        .toBe('https://foo.org/Door');
  });

  it('with single domain URL (http)', () => {
    const ctx = new Context();
    ctx.setUrlContext('http://schema.org');

    expect(ctx.getScopedName(UrlNode.Parse('http://schema.org/Thing')))
        .toBe('Thing');
    expect(ctx.getScopedName(UrlNode.Parse('http://schema.org/rangeIncludes')))
        .toBe('rangeIncludes');
    expect(ctx.getScopedName(UrlNode.Parse('https://schema.org/Door')))
        .toBe('https://schema.org/Door');
    expect(ctx.getScopedName(UrlNode.Parse('http://foo.org/Door')))
        .toBe('http://foo.org/Door');
  });

  it('with multiple URLs', () => {
    const ctx = new Context();
    ctx.addNamedContext('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
    ctx.addNamedContext('rdfs', 'http://www.w3.org/2000/01/rdf-schema#');
    ctx.addNamedContext('schema', 'http://schema.org/');

    expect(ctx.getScopedName(UrlNode.Parse('http://schema.org/Thing')))
        .toBe('schema:Thing');
    expect(ctx.getScopedName(UrlNode.Parse(
               'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')))
        .toBe('rdf:type');
    expect(ctx.getScopedName(UrlNode.Parse(
               'http://www.w3.org/2000/01/rdf-schema#subClassOf')))
        .toBe('rdfs:subClassOf');
    expect(ctx.getScopedName(UrlNode.Parse('http://foo.org/Door')))
        .toBe('http://foo.org/Door');
  });
});

describe('Context.Parse', () => {
  it('one default', () => {
    expect(Context.Parse('https://myschema.org/'))
        .toEqual(ctx(c => c.setUrlContext('https://myschema.org/')));
  });

  it('one default -- leading comma', () => {
    expect(Context.Parse(',https://myschema.org/'))
        .toEqual(ctx(c => c.setUrlContext('https://myschema.org/')));
  });

  it('one default -- trailing comma', () => {
    expect(Context.Parse('https://myschema.org/,'))
        .toEqual(ctx(c => c.setUrlContext('https://myschema.org/')));
  });

  it('one default -- whitespace', () => {
    expect(Context.Parse('  https://myschema.org/\t'))
        .toEqual(ctx(c => c.setUrlContext('https://myschema.org/')));
  });

  it('one default -- commas andwhitespace', () => {
    expect(Context.Parse(' , https://myschema.org/,\t'))
        .toEqual(ctx(c => c.setUrlContext('https://myschema.org/')));
  });

  // One named is not supported.

  it('two named', () => {
    expect(Context.Parse('a:https://schema.org/A,b:https://schema.org/B'))
        .toEqual(ctx(c => {
          c.addNamedContext('a', 'https://schema.org/A');
          c.addNamedContext('b', 'https://schema.org/B');
        }));
  });

  it('two named, whitespace', () => {
    expect(Context.Parse('a:https://schema.org/A ,\tb:https://schema.org/B'))
        .toEqual(ctx(c => {
          c.addNamedContext('a', 'https://schema.org/A');
          c.addNamedContext('b', 'https://schema.org/B');
        }));
  });

  it('two named, extra commas', () => {
    expect(
        Context.Parse(',a:https://schema.org/A ,, ,\tb:https://schema.org/B,,'))
        .toEqual(ctx(c => {
          c.addNamedContext('a', 'https://schema.org/A');
          c.addNamedContext('b', 'https://schema.org/B');
        }));
  });

  it('unexpected lone URL', () => {
    expect(
        () => Context.Parse(
            'a:https://schema.org/A,http://www.com,b:https://schema.org/B'))
        .toThrowError();
  });

  it('unexpected totally off', () => {
    expect(
        () =>
            Context.Parse('a:https://schema.org/A,a=b,b:https://schema.org/B'))
        .toThrowError();
  });
});

function ctx(mutator: (context: Context) => void): Context {
  const context = new Context();
  mutator(context);
  return context;
}