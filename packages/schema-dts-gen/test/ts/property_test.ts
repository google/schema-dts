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

import {Literal, NamedNode, Quad} from 'n3';
import {PropertyType} from '../../src/ts/property.js';
import {makeClass, makeClassMap} from '../helpers/make_class.js';

describe('PropertyType', () => {
  let prop: PropertyType;

  beforeEach(() => {
    prop = new PropertyType(new NamedNode('https://schema.org/name'));
  });

  it('initial properties when empty', () => {
    expect(prop.comment).toBeUndefined();
    expect(prop.deprecated).toBe(false);
  });

  describe('add', () => {
    describe('rangeIncludes', () => {
      const rangeIncludes = () =>
        new NamedNode('https://schema.org/rangeIncludes');

      it('non-type rangeIncludes object fails', () => {
        expect(() =>
          prop.add(
            new Quad(
              new NamedNode('https://schema.org/Foo'),
              rangeIncludes(),
              new Literal('"foo"'),
            ),
            new Map(),
          ),
        ).toThrowError('Type expected to be a UrlNode');
      });

      it("type rangeIncludes object fails when class doesn't exist", () => {
        expect(() =>
          prop.add(
            new Quad(
              new NamedNode('https://schema.org/Foo'),
              rangeIncludes(),
              new NamedNode('https://schema.org/Thing'),
            ),
            new Map(),
          ),
        ).toThrowError('Could not find class for https://schema.org/Thing');
      });

      it('type rangeIncludes object succeeds', () => {
        expect(
          prop.add(
            new Quad(
              new NamedNode('https://schema.org/Foo'),
              rangeIncludes(),
              new NamedNode('https://schema.org/Thing'),
            ),
            makeClassMap(makeClass('https://schema.org/Thing')),
          ),
        ).toBe(true);
      });
    });
  });

  describe('domainIncludes', () => {
    const domainIncludes = () =>
      new NamedNode('https://schema.org/domainIncludes');
    it('failed lookup throws', () => {
      const classes = makeClassMap(makeClass('https://schema.org/Person'));
      expect(() =>
        prop.add(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            domainIncludes(),
            new NamedNode('https://schema.org/Thing'),
          ),
          classes,
        ),
      ).toThrowError('Could not find class');
    });

    it('real lookup works', () => {
      const classes = makeClassMap(makeClass('https://schema.org/Person'));
      expect(
        prop.add(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            domainIncludes(),
            new NamedNode('https://schema.org/Person'),
          ),
          classes,
        ),
      ).toBe(true);
    });
  });

  describe('supersededBy', () => {
    it('always works', () => {
      expect(
        prop.add(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('https://schema.org/supersededBy'),
            new NamedNode('https://schema.org/Person'),
          ),
          new Map(),
        ),
      ).toBe(true);

      expect(prop.comment).toMatch(/@deprecated/g);
      expect(prop.deprecated).toBe(true);
    });
  });

  describe('comment', () => {
    const comment = () =>
      new NamedNode('http://www.w3.org/2000/01/rdf-schema#comment');

    it('works with string', () => {
      expect(
        prop.add(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            comment(),
            new Literal('"foo"'),
          ),
          new Map(),
        ),
      ).toBe(true);

      expect(prop.comment).toMatch(/foo/g);
    });

    it('only supports strings as comments', () => {
      expect(() =>
        prop.add(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            comment(),
            new NamedNode('http://schema.org/Amazing'),
          ),
          new Map(),
        ),
      ).toThrowError('non-string object');
    });
  });
});
