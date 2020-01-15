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
import {ObjectPredicate, TPredicate, TSubject, TTypeName, TypedTopic} from './triple';
import {UrlNode} from './types';

/** Whether the context corresponds to rdf-schema. */
export function IsRdfSchema(value: UrlNode): boolean {
  return value.context.hostname === 'www.w3.org' &&
      value.context.path[value.context.path.length - 1] === 'rdf-schema';
}
/** Whether the context corresponds to rdf-syntax. */
export function IsRdfSyntax(value: UrlNode): boolean {
  return value.context.hostname === 'www.w3.org' &&
      value.context.path[value.context.path.length - 1].match(
          /^\d\d-rdf-syntax-ns$/) !== null;
}
/** Whether the context corresponds to schema.org. */
export function IsSchemaObject(value: UrlNode): boolean {
  return value.context.hostname === 'schema.org';
}

/**
 * If an ObjectPredicate represents a comment, returns the comment. Otherwise
 * returns null.
 */
export function GetComment(value: ObjectPredicate): {comment: string}|null {
  if (IsRdfSchema(value.Predicate) && value.Predicate.name === 'comment') {
    if (value.Object.type === 'SchemaString') {
      return {comment: value.Object.value};
    }
    throw new Error(
        `Unexpected Comment predicate with non-string object: ${value}.`);
  }
  return null;
}

/**
 * If an ObjectPredicate represents a subClass relation, returns the parent
 * class. Otherwise returns null.
 */
export function GetSubClassOf(value: ObjectPredicate): {subClassOf: TSubject}|
    null {
  if (IsRdfSchema(value.Predicate) && value.Predicate.name === 'subClassOf') {
    if (value.Object.type === 'SchemaString' || value.Object.type === 'Rdfs') {
      throw new Error(
          `Unexpected object for predicate 'subClassOf': ${value.Object}.`);
    }
    return {subClassOf: value.Object};
  }
  return null;
}

/** Returns true iff a node corresponds to http://schema.org/DataType */
export function IsDataType(t: TTypeName): boolean {
  return IsSchemaObject(t) && t.name === 'DataType';
}

/** Returns true iff a Topic represents a non-DataType class. */
export function IsClass(topic: TypedTopic): boolean {
  // Skip all Native types. These are covered in wellKnownTypes.
  if (topic.types.some(IsDataType)) return false;

  // Skip the DataType Type itself.
  if (IsDataType(topic.Subject)) return false;

  // Skip anything that isn't a class.
  if (!topic.types.some(IsClassType)) return false;

  return true;
}

/**
 * Returns true iff a Predicate corresponds to http://schema.org/domainIncludes
 */
export function IsDomainIncludes(value: TPredicate): boolean {
  return IsSchemaObject(value) && value.name === 'domainIncludes';
}
/**
 * Returns true iff a Predicate corresponds to http://schema.org/rangeIncludes
 */
export function IsRangeIncludes(value: TPredicate): boolean {
  return IsSchemaObject(value) && value.name === 'rangeIncludes';
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

/**
 * If an ObjectPredicate corresponds to a
 * http://www.w3.org/1999/02/22-rdf-syntax-ns#type, returns a Type it describes.
 */
export function GetType(value: ObjectPredicate): TTypeName|null {
  if (IsType(value.Predicate)) {
    if (value.Object.type === 'Rdfs' || value.Object.type === 'SchemaString') {
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
export function GetTypes(key: TSubject, values: ReadonlyArray<ObjectPredicate>):
    ReadonlyArray<TTypeName> {
  const types = values.map(GetType).filter((t): t is TTypeName => !!t);

  if (types.length === 0) {
    throw new Error(`No type found for Subject ${
        key.toString()}. Triples include:\n${
        values
            .map(
                v => `${v.Predicate.toString()}: ${
                    JSON.stringify(v.Predicate)}\n\t=> ${v.Object.toString()}`)
            .join('\n')}`);
  }

  return types;
}

/**
 * Returns true iff a Type corresponds to
 * http://www.w3.org/2000/01/rdf-schema#Class
 */
export function IsClassType(type: TTypeName): boolean {
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
export function HasEnumType(types: ReadonlyArray<TTypeName>): boolean {
  for (const type of types) {
    // Skip well-known types.
    if (IsClassType(type) || IsPropertyType(type) || IsDataType(type)) continue;

    // If we're here, this is a 'Type' that is not well known.
    return true;
  }
  // Types are only well-known.
  return false;
}
