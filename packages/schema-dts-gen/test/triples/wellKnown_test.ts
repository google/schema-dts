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
import {
  GetComment,
  GetSubClassOf,
  GetType,
  GetTypes,
  IsDirectlyNamedClass,
} from '../../src/triples/wellKnown.js';

describe('wellKnown', () => {
  describe('GetComment', () => {
    it('returns proper string', () => {
      expect(
        GetComment(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
            new Literal('"foo"'),
          ),
        ),
      ).toEqual({comment: 'foo'});
    });

    it('skips other predicates', () => {
      expect(
        GetComment(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#type'),
            new Literal('"foo"'),
          ),
        ),
      ).toBeNull();

      expect(
        GetComment(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://schema.org/comment'),
            new Literal('"foo"'),
          ),
        ),
      ).toBeNull();
    });

    it('only supports strings as comments', () => {
      expect(() =>
        GetComment(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
            new NamedNode('http://schema.org/Amazing'),
          ),
        ),
      ).toThrowError('non-string object');
    });
  });

  describe('GetSubclassOf', () => {
    it('returns proper parent (http)', () => {
      expect(
        GetSubClassOf(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'),
            new NamedNode('http://schema.org/Foo'),
          ),
        ),
      ).toEqual({subClassOf: new NamedNode('http://schema.org/Foo')});
    });

    it('skips other predicates', () => {
      expect(
        GetSubClassOf(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('https://schema.org/knowsAbout'),
            new Literal('"foo"'),
          ),
        ),
      ).toBeNull();

      expect(
        GetSubClassOf(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
            new NamedNode('http://schema.org/Foo'),
          ),
        ),
      ).toBeNull();
    });

    it('only supports UrlNodes as parents', () => {
      expect(() =>
        GetSubClassOf(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'),
            new Literal('"foo"'),
          ),
        ),
      ).toThrowError('Unexpected object for predicate');
    });
  });

  describe('GetType', () => {
    it('returns proper type (enum)', () => {
      expect(
        GetType(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            new NamedNode('https://schema.org/Foo'),
          ),
        ),
      ).toEqual(new NamedNode('https://schema.org/Foo'));
    });

    it('returns proper type (class)', () => {
      expect(
        GetType(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
          ),
        ),
      ).toEqual(new NamedNode('http://www.w3.org/2000/01/rdf-schema#Class'));
    });

    it('skips other predicates', () => {
      expect(
        GetType(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#type'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
          ),
        ),
      ).toBeNull();

      expect(
        GetType(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode(
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#property',
            ),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
          ),
        ),
      ).toBeNull();
    });

    it('only supports UrlNodes as types', () => {
      expect(() =>
        GetType(
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            new Literal('"foo"'),
          ),
        ),
      ).toThrowError('Unexpected type');
    });
  });

  describe('GetTypes', () => {
    it('Returns one', () => {
      expect(
        GetTypes([
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
          ),
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            new Literal('"Thing"'),
          ),
        ]),
      ).toEqual([new NamedNode('http://www.w3.org/2000/01/rdf-schema#Class')]);
    });

    it('Returns multiple', () => {
      expect(
        GetTypes([
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
          ),
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/2000/01/rdf-schema#label'),
            new Literal('"Thing"'),
          ),
          new Quad(
            new NamedNode('https://schema.org/Foo'),
            new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            new NamedNode('http://schema.org/Thing'),
          ),
        ]),
      ).toEqual([
        new NamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
        new NamedNode('http://schema.org/Thing'),
      ]);
    });
  });

  describe('IsDirectlyNamedClass', () => {
    const cls = new NamedNode('http://www.w3.org/2000/01/rdf-schema#Class');
    const dataType = new NamedNode('http://schema.org/DataType');
    const bool = new NamedNode('http://schema.org/Boolean');

    it('a data type is a named class', () => {
      expect(
        IsDirectlyNamedClass({
          subject: new NamedNode('https://schema.org/Text'),
          types: [cls, dataType],
          quads: [],
        }),
      ).toBe(true);

      expect(
        IsDirectlyNamedClass({
          subject: new NamedNode('https://schema.org/Text'),
          types: [dataType, cls],
          quads: [],
        }),
      ).toBe(true);
    });

    it('an only-enum is not a class', () => {
      expect(
        IsDirectlyNamedClass({
          subject: new NamedNode('https://schema.org/True'),
          types: [bool],
          quads: [],
        }),
      ).toBe(false);
    });

    it('an enum can still be a class', () => {
      expect(
        IsDirectlyNamedClass({
          subject: new NamedNode('https://schema.org/ItsComplicated'),
          types: [bool, cls],
          quads: [],
        }),
      ).toBe(true);
    });

    it('the DataType union is a class', () => {
      expect(
        IsDirectlyNamedClass({
          subject: new NamedNode('https://schema.org/DataType'),
          types: [cls],
          quads: [
            new Quad(
              new NamedNode('https://schema.org/Foo'),
              new NamedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'),
              new NamedNode('http://www.w3.org/2000/01/rdf-schema#Class'),
            ),
          ],
        }),
      ).toBe(true);
    });
  });
});
