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
import {Rdfs, SchemaString, UrlNode} from '../../src/triples/types';
import {
  GetComment,
  GetSubClassOf,
  GetType,
  GetTypes,
  IsClass,
} from '../../src/triples/wellKnown';

describe('wellKnown', () => {
  describe('GetComment', () => {
    it('returns proper string', () => {
      expect(
        GetComment({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#comment'
          ),
          Object: new SchemaString('foo', 'en'),
        })
      ).toEqual({comment: 'foo'});
    });

    it('skips other predicates', () => {
      expect(
        GetComment({
          Predicate: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#type'),
          Object: new SchemaString('foo', 'en'),
        })
      ).toBeNull();

      expect(
        GetComment({
          Predicate: UrlNode.Parse('http://schema.org/comment'),
          Object: new SchemaString('foo', 'en'),
        })
      ).toBeNull();
    });

    it('only supports strings as comments', () => {
      expect(() =>
        GetComment({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#comment'
          ),
          Object: UrlNode.Parse('http://schema.org/Amazing'),
        })
      ).toThrowError('non-string object');
    });
  });

  describe('GetSubclassOf', () => {
    it('returns proper parent (http)', () => {
      expect(
        GetSubClassOf({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#subClassOf'
          ),
          Object: UrlNode.Parse('http://schema.org/Foo'),
        })
      ).toEqual({subClassOf: UrlNode.Parse('http://schema.org/Foo')});
    });

    it('returns proper parent (https)', () => {
      expect(
        GetSubClassOf({
          Predicate: UrlNode.Parse(
            'https://www.w3.org/2000/01/rdf-schema#subClassOf'
          ),
          Object: UrlNode.Parse('http://schema.org/Foo'),
        })
      ).toEqual({subClassOf: UrlNode.Parse('http://schema.org/Foo')});
    });

    it('skips other predicates', () => {
      expect(
        GetSubClassOf({
          Predicate: UrlNode.Parse('https://schema.org/knowsAbout'),
          Object: new SchemaString('foo', undefined),
        })
      ).toBeNull();

      expect(
        GetSubClassOf({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#comment'
          ),
          Object: UrlNode.Parse('http://schema.org/Foo'),
        })
      ).toBeNull();
    });

    it('only supports UrlNodes as parents', () => {
      expect(() =>
        GetSubClassOf({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#subClassOf'
          ),
          Object: new SchemaString('foo', 'en'),
        })
      ).toThrowError('Unexpected object for predicate');

      expect(() =>
        GetSubClassOf({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#subClassOf'
          ),
          Object: new Rdfs('foo'),
        })
      ).toThrowError('Unexpected object for predicate');
    });
  });

  describe('GetType', () => {
    it('returns proper type (enum)', () => {
      expect(
        GetType({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
          ),
          Object: UrlNode.Parse('https://schema.org/Foo'),
        })
      ).toEqual(UrlNode.Parse('https://schema.org/Foo'));
    });

    it('returns proper type (class)', () => {
      expect(
        GetType({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
          ),
          Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
        })
      ).toEqual(UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'));
    });

    it('skips other predicates', () => {
      expect(
        GetType({
          Predicate: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#type'),
          Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
        })
      ).toBeNull();

      expect(
        GetType({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#property'
          ),
          Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
        })
      ).toBeNull();
    });

    it('only supports UrlNodes as types', () => {
      expect(() =>
        GetType({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
          ),
          Object: new SchemaString('foo', undefined),
        })
      ).toThrowError('Unexpected type');

      expect(() =>
        GetType({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
          ),
          Object: new Rdfs('foo'),
        })
      ).toThrowError('Unexpected type');
    });
  });

  describe('GetTypes', () => {
    it('Returns one', () => {
      expect(
        GetTypes(UrlNode.Parse('https://schema.org/Thing'), [
          {
            Predicate: UrlNode.Parse(
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
            ),
            Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
          },
          {
            Predicate: UrlNode.Parse(
              'http://www.w3.org/2000/01/rdf-schema#label'
            ),
            Object: new SchemaString('Thing', undefined),
          },
        ])
      ).toEqual([UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class')]);
    });

    it('Returns multiple', () => {
      expect(
        GetTypes(UrlNode.Parse('https://schema.org/Widget'), [
          {
            Predicate: UrlNode.Parse(
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
            ),
            Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
          },
          {
            Predicate: UrlNode.Parse(
              'http://www.w3.org/2000/01/rdf-schema#label'
            ),
            Object: new SchemaString('Thing', undefined),
          },
          {
            Predicate: UrlNode.Parse(
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
            ),
            Object: UrlNode.Parse('http://schema.org/Thing'),
          },
        ])
      ).toEqual([
        UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
        UrlNode.Parse('http://schema.org/Thing'),
      ]);
    });

    it('Throws if none', () => {
      expect(() =>
        GetTypes(UrlNode.Parse('https://schema.org/Widget'), [])
      ).toThrowError('No type found');

      expect(() =>
        GetTypes(UrlNode.Parse('https://schema.org/Widget'), [
          {
            Predicate: UrlNode.Parse(
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#property'
            ),
            Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
          },
          {
            Predicate: UrlNode.Parse(
              'http://www.w3.org/2000/01/rdf-schema#label'
            ),
            Object: new SchemaString('Thing', undefined),
          },
        ])
      ).toThrowError('No type found');
    });
  });

  describe('IsClass', () => {
    const cls = UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class');
    const dataType = UrlNode.Parse('http://schema.org/DataType');
    const bool = UrlNode.Parse('http://schema.org/Boolean');

    it('a data type is not a class', () => {
      expect(
        IsClass({
          Subject: UrlNode.Parse('https://schema.org/Text'),
          types: [cls, dataType],
          values: [],
        })
      ).toBe(false);

      expect(
        IsClass({
          Subject: UrlNode.Parse('https://schema.org/Text'),
          types: [dataType, cls],
          values: [],
        })
      ).toBe(false);
    });

    it('an only-enum is not a class', () => {
      expect(
        IsClass({
          Subject: UrlNode.Parse('https://schema.org/True'),
          types: [bool],
          values: [],
        })
      ).toBe(false);
    });

    it('an enum can still be a class', () => {
      expect(
        IsClass({
          Subject: UrlNode.Parse('https://schema.org/ItsComplicated'),
          types: [bool, cls],
          values: [],
        })
      ).toBe(true);
    });

    it('the DataType union is not a class', () => {
      expect(
        IsClass({
          Subject: UrlNode.Parse('https://schema.org/DataType'),
          types: [cls],
          values: [
            {
              Predicate: UrlNode.Parse(
                'http://www.w3.org/2000/01/rdf-schema#subClassOf'
              ),
              Object: UrlNode.Parse(
                'http://www.w3.org/2000/01/rdf-schema#Class'
              ),
            },
          ],
        })
      ).toBe(false);
    });
  });
});
