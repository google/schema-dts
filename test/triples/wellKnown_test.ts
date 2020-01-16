import {expect} from 'chai';

import {Rdfs, SchemaString, UrlNode} from '../../src/triples/types';
import {GetComment, GetSubClassOf, GetType, GetTypes, IsClass} from '../../src/triples/wellKnown';

describe('wellKnown', () => {
  describe('GetComment', () => {
    it('returns proper string', () => {
      expect(GetComment({
        Predicate:
            UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#comment'),
        Object: new SchemaString('foo', 'en')
      })).to.deep.equal({comment: 'foo'});
    });

    it('skips other predicates', () => {
      expect(GetComment({
        Predicate: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#type'),
        Object: new SchemaString('foo', 'en')
      })).to.be.null;

      expect(GetComment({
        Predicate: UrlNode.Parse('http://schema.org/comment'),
        Object: new SchemaString('foo', 'en')
      })).to.be.null;
    });

    it('only supports strings as comments', () => {
      expect(() => GetComment({
               Predicate: UrlNode.Parse(
                   'http://www.w3.org/2000/01/rdf-schema#comment'),
               Object: UrlNode.Parse('http://schema.org/Amazing')
             }))
          .to.throw('non-string object');
    });
  });

  describe('GetSubclassOf', () => {
    it('returns proper parent (http)', () => {
      expect(GetSubClassOf({
        Predicate:
            UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#subClassOf'),
        Object: UrlNode.Parse('http://schema.org/Foo')
      })).to.deep.equal({subClassOf: UrlNode.Parse('http://schema.org/Foo')});
    });

    it('returns proper parent (https)', () => {
      expect(GetSubClassOf({
        Predicate:
            UrlNode.Parse('https://www.w3.org/2000/01/rdf-schema#subClassOf'),
        Object: UrlNode.Parse('http://schema.org/Foo')
      })).to.deep.equal({subClassOf: UrlNode.Parse('http://schema.org/Foo')});
    });

    it('skips other predicates', () => {
      expect(GetSubClassOf({
        Predicate: UrlNode.Parse('https://schema.org/knowsAbout'),
        Object: new SchemaString('foo', undefined)
      })).to.be.null;

      expect(GetSubClassOf({
        Predicate:
            UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#comment'),
        Object: UrlNode.Parse('http://schema.org/Foo')
      })).to.be.null;
    });

    it('only supports UrlNodes as parents', () => {
      expect(() => GetSubClassOf({
               Predicate: UrlNode.Parse(
                   'http://www.w3.org/2000/01/rdf-schema#subClassOf'),
               Object: new SchemaString('foo', 'en')
             }))
          .to.throw('Unexpected object for predicate');

      expect(() => GetSubClassOf({
               Predicate: UrlNode.Parse(
                   'http://www.w3.org/2000/01/rdf-schema#subClassOf'),
               Object: new Rdfs('foo')
             }))
          .to.throw('Unexpected object for predicate');
    });
  });

  describe('GetType', () => {
    it('returns proper type (enum)', () => {
      expect(GetType({
        Predicate:
            UrlNode.Parse('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        Object: UrlNode.Parse('https://schema.org/Foo')
      })).to.deep.equal(UrlNode.Parse('https://schema.org/Foo'));
    });

    it('returns proper type (class)', () => {
      expect(GetType({
        Predicate:
            UrlNode.Parse('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class')
      }))
          .to.deep.equal(
              UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'));
    });

    it('skips other predicates', () => {
      expect(GetType({
        Predicate: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#type'),
        Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class')
      })).to.be.null;

      expect(GetType({
        Predicate: UrlNode.Parse(
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#property'),
        Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class')
      })).to.be.null;
    });

    it('only supports UrlNodes as types', () => {
      expect(() => GetType({
               Predicate: UrlNode.Parse(
                   'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
               Object: new SchemaString('foo', undefined)
             }))
          .to.throw('Unexpected type');

      expect(() => GetType({
               Predicate: UrlNode.Parse(
                   'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
               Object: new Rdfs('foo')
             }))
          .to.throw('Unexpected type');
    });
  });

  describe('GetTypes', () => {
    it('Returns one', () => {
      expect(GetTypes(
                 UrlNode.Parse('https://schema.org/Thing'),
                 [
                   {
                     Predicate: UrlNode.Parse(
                         'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                     Object: UrlNode.Parse(
                         'http://www.w3.org/2000/01/rdf-schema#Class')
                   },
                   {
                     Predicate: UrlNode.Parse(
                         'http://www.w3.org/2000/01/rdf-schema#label'),
                     Object: new SchemaString('Thing', undefined)
                   },
                 ]))
          .to.deep.equal(
              [UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class')]);
    });

    it('Returns multiple', () => {
      expect(GetTypes(
                 UrlNode.Parse('https://schema.org/Widget'),
                 [
                   {
                     Predicate: UrlNode.Parse(
                         'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                     Object: UrlNode.Parse(
                         'http://www.w3.org/2000/01/rdf-schema#Class')
                   },
                   {
                     Predicate: UrlNode.Parse(
                         'http://www.w3.org/2000/01/rdf-schema#label'),
                     Object: new SchemaString('Thing', undefined)
                   },
                   {
                     Predicate: UrlNode.Parse(
                         'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                     Object: UrlNode.Parse('http://schema.org/Thing')
                   },
                 ]))
          .to.deep.equal([
            UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
            UrlNode.Parse('http://schema.org/Thing')
          ]);
    });

    it('Throws if none', () => {
      expect(() => GetTypes(UrlNode.Parse('https://schema.org/Widget'), []))
          .to.throw('No type found');

      expect(
          () => GetTypes(
              UrlNode.Parse('https://schema.org/Widget'),
              [
                {
                  Predicate: UrlNode.Parse(
                      'http://www.w3.org/1999/02/22-rdf-syntax-ns#property'),
                  Object: UrlNode.Parse(
                      'http://www.w3.org/2000/01/rdf-schema#Class')
                },
                {
                  Predicate: UrlNode.Parse(
                      'http://www.w3.org/2000/01/rdf-schema#label'),
                  Object: new SchemaString('Thing', undefined)
                }
              ]))
          .to.throw('No type found');
    });
  });

  describe('IsClass', () => {
    const cls = UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class');
    const dataType = UrlNode.Parse('http://schema.org/DataType');
    const bool = UrlNode.Parse('http://schema.org/Boolean');

    it('a data type is not a class', () => {
      expect(IsClass({
        Subject: UrlNode.Parse('https://schema.org/Text'),
        types: [cls, dataType],
        values: []
      })).to.be.false;

      expect(IsClass({
        Subject: UrlNode.Parse('https://schema.org/Text'),
        types: [dataType, cls],
        values: []
      })).to.be.false;
    });

    it('an only-enum is not a class', () => {
      expect(IsClass({
        Subject: UrlNode.Parse('https://schema.org/True'),
        types: [bool],
        values: []
      })).to.be.false;
    });

    it('an enum can still be a class', () => {
      expect(IsClass({
        Subject: UrlNode.Parse('https://schema.org/ItsComplicated'),
        types: [bool, cls],
        values: []
      })).to.be.true;
    });

    it('the DataType union is not a class', () => {
      expect(IsClass({
        Subject: UrlNode.Parse('https://schema.org/DataType'),
        types: [cls],
        values: [{
          Predicate:
              UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#subClassOf'),
          Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class')
        }]
      })).to.be.false;
    });
  });
});