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

import {NamedNode} from 'n3';
import type {Quad, Term, Quad_Object, Quad_Predicate, Quad_Subject} from 'n3';

export interface Topic {
  subject: Quad_Subject;
  quads: Quad[];
}

export interface TypedTopic extends Topic {
  types: readonly NamedNode[];
}

const rdfSchemaPrefix = 'http://www.w3.org/2000/01/rdf-schema#';
const rdfSyntaxPrefix = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const schemaPrefix = ['http://schema.org/', 'https://schema.org/'] as const;
const owlPrefix = 'http://www.w3.org/2002/07/owl#';

function possibleTerms(
  prefix: string | readonly string[],
  names: string | readonly string[],
): NamedNode[] {
  if (prefix instanceof Array) {
    return prefix.map(p => possibleTerms(p, names)).flat();
  }
  if (names instanceof Array) {
    return names.map(n => possibleTerms(prefix, n)).flat();
  }

  return [new NamedNode(`${prefix}${names}`)];
}

function debugStr(node: Quad | Term): string {
  return JSON.stringify(node.toJSON(), undefined, 2);
}

// Well-known properties
const Type = new NamedNode(`${rdfSyntaxPrefix}type`);
const Comment = possibleTerms(rdfSchemaPrefix, 'comment');
const SubClassOf = possibleTerms(rdfSchemaPrefix, 'subClassOf');
const DomainIncludes = [
  ...possibleTerms(schemaPrefix, 'domainIncludes'),
  // Technically "domainIncludes" and "domain" have different semantics.
  // domainIncludes is repeated, to include a union of possible types in the
  // domain. "domain" is expected to appear once. To use "domain" for a union of
  // possible values, it is used with owl:unionOf and a list literal.
  ...possibleTerms(rdfSchemaPrefix, 'domain'),
];
const RangeIncludes = [
  ...possibleTerms(schemaPrefix, 'rangeIncludes'),
  // See comment on domainIncludes vs domain above.
  ...possibleTerms(rdfSchemaPrefix, 'range'),
];
const SupersededBy = possibleTerms(schemaPrefix, 'supersededBy');

// Well-known classes
const Class = new NamedNode(`${rdfSchemaPrefix}Class`);
const Property = new NamedNode(`${rdfSyntaxPrefix}Property`);
const OWLProperty = possibleTerms(owlPrefix, [
  'DatatypeProperty',
  'ObjectProperty',
  'FunctionalProperty',
  'InverseFunctionalProperty',
  'AnnotationProperty',
  'SymmetricProperty',
  'TransitiveProperty',
]);
const OWLClass = possibleTerms(owlPrefix, 'Class');
const OWLOntology = possibleTerms(owlPrefix, 'Ontology');
const DataType = possibleTerms(schemaPrefix, 'DataType');

/**
 * If an ObjectPredicate represents a comment, returns the comment. Otherwise
 * returns null.
 */
export function GetComment(q: Quad): {comment: string} | null {
  if (Comment.some(c => c.equals(q.predicate))) {
    if (q.object.termType === 'Literal') return {comment: q.object.value};
    throw new Error(
      `Unexpected Comment predicate with non-string object: ${debugStr(q)}.`,
    );
  }
  return null;
}

/**
 * If an ObjectPredicate represents a subClass relation, returns the parent
 * class. Otherwise returns null.
 */
export function GetSubClassOf(q: Quad): {subClassOf: NamedNode} | null {
  if (SubClassOf.some(s => s.equals(q.predicate))) {
    if (q.object.termType !== 'NamedNode') {
      throw new Error(
        `Unexpected object for predicate 'subClassOf': ${debugStr(q)}`,
      );
    }

    return {subClassOf: q.object};
  }
  return null;
}

/** Return true iff this object is a subclass of some other entity. */
export function IsSubclass(topic: TypedTopic) {
  return topic.quads.some(q => SubClassOf.some(s => s.equals(q.predicate)));
}

/** Returns true iff a node corresponds to http://schema.org/DataType */
export function IsDataType(t: Quad_Subject): boolean {
  return DataType.some(d => d.equals(t));
}

/** Returns true iff a Topic represents a DataType. */
export function ClassIsDataType(topic: TypedTopic): boolean {
  if (topic.types.some(IsDataType)) return true;
  return false;
}

/**
 * Returns true iff a Topic represents a named class.
 *
 * Note that some schemas define subclasses without explicitly redefining them
 * as classes. So just because a topic isn't directly named as a class doesn't
 * mean that it isn't a named class.
 *
 * A named class is such if it *OR ANY OF ITS PARENTS* are directly named
 * classes.
 */
export function IsDirectlyNamedClass(topic: TypedTopic): boolean {
  // Skip anything that isn't a class.
  return topic.types.some(IsClassType);
}

/**
 * Returns true iff a Predicate corresponds to http://schema.org/domainIncludes
 */
export function IsDomainIncludes(value: Quad_Predicate): boolean {
  return DomainIncludes.some(d => d.equals(value));
}
/**
 * Returns true iff a Predicate corresponds to http://schema.org/rangeIncludes
 */
export function IsRangeIncludes(value: Quad_Predicate): boolean {
  return RangeIncludes.some(r => r.equals(value));
}
/**
 * Returns true iff a Predicate corresponds to http://schema.org/supersededBy.
 */
export function IsSupersededBy(value: Quad_Predicate): boolean {
  return SupersededBy.some(s => s.equals(value));
}
/**
 * Returns true iff a Predicate corresponds to
 * http://www.w3.org/1999/02/22-rdf-syntax-ns#type.
 */
export function IsType(predicate: Quad_Predicate): boolean {
  return predicate.equals(Type);
}

/** Returns iff an Object can be described as a Type Name. */
export function IsTypeName(value: Quad_Object): value is NamedNode {
  return value.termType === 'NamedNode';
}

/**
 * If an ObjectPredicate corresponds to a
 * http://www.w3.org/1999/02/22-rdf-syntax-ns#type, returns a Type it describes.
 */
export function GetType(value: Quad): NamedNode | null {
  if (IsType(value.predicate)) {
    if (!IsTypeName(value.object)) {
      throw new Error(`Unexpected type ${debugStr(value)}`);
    }
    return value.object;
  }
  return null;
}

/**
 * Returns all Nodes described by a Topic's
 * http://www.w3.org/1999/02/22-rdf-syntax-ns#type predicates.
 */
export function GetTypes(values: readonly Quad[]): readonly NamedNode[] {
  const types = values.map(GetType).filter((t): t is NamedNode => !!t);

  // Allow empty types. Some custom schema assume "transitive" typing, e.g.
  // gs1 has a TypeCode class which is an rdfs:Class, but its subclasses are
  // not explicitly described as an rdfs:Class.
  return types;
}

/**
 * Returns true iff a Type corresponds to
 * http://www.w3.org/2000/01/rdf-schema#Class
 */
export function IsClassType(type: Term): boolean {
  return Class.equals(type);
}

/**
 * Returns true iff a Type corresponds to
 * http://www.w3.org/1999/02/22-rdf-syntax-ns#Property
 */
export function IsPropertyType(type: Term): boolean {
  return Property.equals(type);
}

/**
 * Returns true iff a Subject has a Type indicating it is an Enum value.
 *
 * Enum Values have, in addition to other Data or Class types, another object as
 * its "Type".
 */
export function HasEnumType(types: readonly NamedNode[]): boolean {
  for (const type of types) {
    // Skip well-known types.
    if (IsClassType(type) || IsPropertyType(type) || IsDataType(type)) continue;

    // Skip OWL "meta" types
    if (OWLClass.some(c => c.equals(type))) continue;
    if (OWLProperty.some(c => c.equals(type))) continue;
    if (OWLOntology.some(c => c.equals(type))) continue;

    // If we're here, this is a 'Type' that is not well known.
    return true;
  }
  // Types are only well-known.
  return false;
}
