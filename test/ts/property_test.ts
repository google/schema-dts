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

import { Rdfs, SchemaString, UrlNode } from '../../src/triples/types';
import {PropertyType} from '../../src/ts/property';
import {makeClass, makeClassMap} from '../helpers/make_class';

describe('PropertyType', () => {
  let prop: PropertyType;

  beforeEach(() => {
    prop = new PropertyType(UrlNode.Parse('https://schema.org/name'));
  });

  it('initial properties when empty', () => {
    expect(prop.comment).toBeUndefined();
    expect(prop.deprecated).toBe(false);
  });

  describe('add', () => {
    describe('rangeIncludes', () => {
      const rangeIncludes = () =>
          UrlNode.Parse('https://schema.org/rangeIncludes');

      it('non-type rangeIncludes object fails', () => {
        expect(
            () => prop.add(
                {
                  Predicate: rangeIncludes(),
                  Object: new SchemaString('foo', 'en')
                },
                new Map)).toThrowError('Type expected to be a UrlNode');

        expect(
            () => prop.add(
                {Predicate: rangeIncludes(), Object: new Rdfs('foo')}, new Map)).toThrowError('Type expected to be a UrlNode');
      });

      it('type rangeIncludes object succeeds', () => {
        expect(prop.add(
                   {
                     Predicate: rangeIncludes(),
                     Object: UrlNode.Parse('https://schema.org/Thing')
                   },
                   new Map)).toBe(true);
      });
    });
  });

  describe('domainIncludes', () => {
    const domainIncludes = () =>
        UrlNode.Parse('https://schema.org/domainIncludes');
    it('failed lookup throws', () => {
      const classes = makeClassMap(makeClass('https://schema.org/Person'));
      expect(
          () => prop.add(
              {
                Predicate: domainIncludes(),
                Object: UrlNode.Parse('https://schema.org/Thing')
              },
              classes)).toThrowError('Could not find class');
    });

    it('real lookup works', () => {
      const classes = makeClassMap(makeClass('https://schema.org/Person'));
      expect(prop.add(
                 {
                   Predicate: domainIncludes(),
                   Object: UrlNode.Parse('https://schema.org/Person')
                 },
                 classes)).toBe(true);
    });
  });

  describe('supersededBy', () => {
    it('always works', () => {
      expect(prop.add(
                 {
                   Predicate: UrlNode.Parse('https://schema.org/supersededBy'),
                   Object: UrlNode.Parse('https://schema.org/Person')
                 },
                 new Map)).toBe(true);

      expect(prop.comment).toMatch(/@deprecated/g);
      expect(prop.deprecated).toBe(true);
    });
  });

  describe('comment', () => {
    const comment = () =>
        UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#comment');

    it('works with string', () => {
      expect(prop.add(
                 {Predicate: comment(), Object: new SchemaString('foo', 'en')},
                 new Map)).toBe(true);

      expect(prop.comment).toMatch(/foo/g);
    });

    it('only supports strings as comments', () => {
      expect(
          () => prop.add(
              {
                Predicate: comment(),
                Object: UrlNode.Parse('http://schema.org/Amazing')
              },
              new Map)).toThrowError('non-string object');
    });
  });
});
