/**
 * Copyright 2018 Google LLC
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

export function IsRdfSchema(value: UrlNode): boolean {
  return value.context.hostname === 'www.w3.org' &&
      value.context.path[value.context.path.length - 1] === 'rdf-schema';
}
export function IsRdfSyntax(value: UrlNode): boolean {
  return value.context.hostname === 'www.w3.org' &&
      value.context.path[value.context.path.length - 1].match(
          /^\d\d-rdf-syntax-ns$/) !== null;
}
export function IsSchemaObject(value: UrlNode): boolean {
  return value.context.hostname === 'schema.org';
}

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

export type TParentClassName = UrlNode;
export function GetSubClassOf(value: ObjectPredicate):
    {subClassOf: TParentClassName}|null {
  if (IsRdfSchema(value.Predicate) && value.Predicate.name === 'subClassOf') {
    if (value.Object.type === 'SchemaString' || value.Object.type === 'Rdfs') {
      throw new Error(
          `Unexpected object for predicate 'subClassOf': ${value.Object}.`);
    }
    return {subClassOf: value.Object};
  }
  return null;
}

export function IsDataType(t: TTypeName): boolean {
  return IsSchemaObject(t) && t.name === 'DataType';
}

export function IsClass(topic: TypedTopic): boolean {
  // Skip all Native types. These are covered in wellKnownTypes.
  if (topic.types.some(IsDataType)) return false;

  // Skip the DataType Type itself.
  if (IsDataType(topic.Subject)) return false;

  // Skip anything that isn't a class.
  if (!topic.types.some(IsClassType)) return false;

  return true;
}

export function IsDomainIncludes(value: TPredicate): boolean {
  return IsSchemaObject(value) && value.name === 'domainIncludes';
}
export function IsRangeIncludes(value: TPredicate): boolean {
  return IsSchemaObject(value) && value.name === 'rangeIncludes';
}
export function IsSupersededBy(value: ObjectPredicate): boolean {
  return IsSchemaObject(value.Predicate) &&
      value.Predicate.name === 'supersededBy';
}

export function GetType(value: ObjectPredicate): TTypeName|null {
  if (IsRdfSyntax(value.Predicate) && value.Predicate.name === 'type') {
    if (value.Object.type === 'Rdfs' || value.Object.type === 'SchemaString') {
      throw new Error(`Unexpected type ${value.Object}`);
    }
    return value.Object;
  }
  return null;
}

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

export function IsClassType(type: TTypeName): boolean {
  return IsRdfSchema(type) && type.name === 'Class';
}
export function IsPropertyType(type: TTypeName): boolean {
  return IsRdfSyntax(type) && type.name === 'Property';
}

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
