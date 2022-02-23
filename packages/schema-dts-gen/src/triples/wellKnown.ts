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
import {
  ObjectPredicate,
  TObject,
  TPredicate,
  TSubject,
  TTypeName,
  TypedTopic,
} from './triple.js';
import {NamedUrlNode, UrlNode} from './types.js';

/** Whether the context corresponds to rdf-schema. */
export function IsRdfSchema(value: UrlNode): boolean {
  return (
    value.context.hostname === 'www.w3.org' &&
    value.context.path[value.context.path.length - 1] === 'rdf-schema'
  );
}
/** Whether the context corresponds to rdf-syntax. */
export function IsRdfSyntax(value: UrlNode): boolean {
  return (
    value.context.hostname === 'www.w3.org' &&
    value.context.path[value.context.path.length - 1].match(
      /^\d\d-rdf-syntax-ns$/
    ) !== null
  );
}
/** Whether the context corresponds to schema.org. */
export function IsSchemaObject(value: UrlNode): boolean {
  return value.context.hostname === 'schema.org';
}
/** Wheter the context corresponds to OWL */
export function IsOWL(value: UrlNode): boolean {
  return (
    value.context.hostname === 'www.w3.org' &&
    value.context.path[value.context.path.length - 1] === 'owl'
  );
}

/**
 * If an ObjectPredicate represents a comment, returns the comment. Otherwise
 * returns null.
 */
export function GetComment(value: ObjectPredicate): {comment: string} | null {
  if (IsRdfSchema(value.Predicate) && value.Predicate.name === 'comment') {
    if (value.Object.type === 'SchemaString') {
      return {comment: value.Object.value};
    }
    throw new Error(
      `Unexpected Comment predicate with non-string object: ${value}.`
    );
  }
  return null;
}

/**
 * If an ObjectPredicate represents a subClass relation, returns the parent
 * class. Otherwise returns null.
 */
export function GetSubClassOf(
  value: ObjectPredicate
): {subClassOf: TTypeName} | null {
  if (IsRdfSchema(value.Predicate) && value.Predicate.name === 'subClassOf') {
    if (value.Object.type === 'SchemaString' || value.Object.type === 'Rdfs') {
      throw new Error(
        `Unexpected object for predicate 'subClassOf': ${value.Object}.`
      );
    }
    if (!IsNamedUrl(value.Object)) {
      throw new Error(
        `Unexpected "unnamed" URL used as a super-class: ${value.Object}`
      );
    }
    return {subClassOf: value.Object};
  }
  return null;
}

/** Return true iff this object is a subclass of some other entity. */
export function IsSubclass(topic: TypedTopic) {
  return topic.values.some(op => GetSubClassOf(op) !== null);
}

/** Returns true iff a UrlNode has a "name" it can be addressed with. */
export function IsNamedUrl(t: UrlNode): t is NamedUrlNode {
  return t.name !== undefined;
}

/** Returns true iff a node corresponds to http://schema.org/DataType */
export function IsDataType(t: TSubject): boolean {
  return IsSchemaObject(t) && t.name === 'DataType';
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
export function IsDomainIncludes(value: TPredicate): boolean {
  return (
    (IsSchemaObject(value) && value.name === 'domainIncludes') ||
    (IsRdfSchema(value) && value.name === 'domain')
  );
}
/**
 * Returns true iff a Predicate corresponds to http://schema.org/rangeIncludes
 */
export function IsRangeIncludes(value: TPredicate): boolean {
  return (
    (IsSchemaObject(value) && value.name === 'rangeIncludes') ||
    (IsRdfSchema(value) && value.name === 'range')
  );
}
/**
 * Returns true iff a Predicate corresponds to http://schema.org/supersededBy.
 */
export function IsSupersededBy(value: TPredicate): boolean {
  return IsSchemaObject(value) && value.name === 'supersededBy';
}
/**
 * Returns true iff a Predicate corresponds to
 * http://www.w3.org/1999/02/22-rdf-syntax-ns#type.
 */
export function IsType(predicate: TPredicate): boolean {
  return IsRdfSyntax(predicate) && predicate.name === 'type';
}

/** Returns iff an Object can be described as a Type Name. */
export function IsTypeName(value: TObject): value is TTypeName {
  return value.type === 'UrlNode';
}

/**
 * If an ObjectPredicate corresponds to a
 * http://www.w3.org/1999/02/22-rdf-syntax-ns#type, returns a Type it describes.
 */
export function GetType(value: ObjectPredicate): TTypeName | null {
  if (IsType(value.Predicate)) {
    if (!IsTypeName(value.Object)) {
      throw new Error(`Unexpected type ${value.Object}`);
    }
    return value.Object;
  }
  return null;
}

/**
 * Returns all Nodes described by a Topic's
 * http://www.w3.org/1999/02/22-rdf-syntax-ns#type predicates.
 */
export function GetTypes(
  key: TSubject,
  values: readonly ObjectPredicate[]
): readonly TTypeName[] {
  const types = values.map(GetType).filter((t): t is TTypeName => !!t);

  // Allow empty types. Some custom schema assume "transitive" typing, e.g.
  // gs1 has a TypeCode class which is an rdfs:Class, but its subclasses are
  // not explicitly described as an rdfs:Class.
  return types;
}

/**
 * Returns true iff a Type corresponds to
 * http://www.w3.org/2000/01/rdf-schema#Class
 */
export function IsClassType(type: UrlNode): boolean {
  return IsRdfSchema(type) && type.name === 'Class';
}

/**
 * Returns true iff a Type corresponds to
 * http://www.w3.org/1999/02/22-rdf-syntax-ns#Property
 */
export function IsPropertyType(type: TTypeName): boolean {
  return IsRdfSyntax(type) && type.name === 'Property';
}

/**
 * Returns true iff a Subject has a Type indicating it is an Enum value.
 *
 * Enum Values have, in addition to other Data or Class types, another object as
 * its "Type".
 */
export function HasEnumType(types: readonly TTypeName[]): boolean {
  for (const type of types) {
    // Skip well-known types.
    if (IsClassType(type) || IsPropertyType(type) || IsDataType(type)) continue;

    // Skip OWL "meta" types:
    if (IsOWL(type)) {
      if (
        [
          'Ontology',
          'Class',
          'DatatypeProperty',
          'ObjectProperty',
          'FunctionalProperty',
          'InverseFunctionalProperty',
          'AnnotationProperty',
          'SymmetricProperty',
          'TransitiveProperty',
        ].includes(type.name)
      ) {
        continue;
      }
    }

    // If we're here, this is a 'Type' that is not well known.
    return true;
  }
  // Types are only well-known.
  return false;
}
