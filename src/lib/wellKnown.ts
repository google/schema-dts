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
import {ObjectPredicate, TPredicate, TSubject} from './triple';
import {RdfSchema, RdfSyntax, SchemaObject, SchemaSource, W3CNameSpaced} from './types';

export function GetComment(value: ObjectPredicate): {comment: string}|null {
  if (value.Predicate.type === 'RdfSchema' &&
      value.Predicate.hash === 'comment') {
    if (value.Object.type === 'SchemaString') {
      return {comment: value.Object.value};
    }
    console.error(
        `Unexpected Comment predicate with non-string object: ${value}.`);
  }
  return null;
}

export type TParentClassName = SchemaObject|SchemaSource|W3CNameSpaced;
export function GetSubClassOf(value: ObjectPredicate):
    {subClassOf: TParentClassName}|null {
  if (value.Predicate.type === 'RdfSchema' &&
      value.Predicate.hash === 'subClassOf') {
    if (value.Object.type === 'RdfSchema' || value.Object.type === 'RdfSntax' ||
        value.Object.type === 'SchemaString' || value.Object.type === 'Rdfs' ||
        value.Object.type === 'WikidataConst' ||
        value.Object.type === 'OneOffClass') {
      console.error(
          `Unexpected object for predicate 'subClassOf': ${value.Object}.`);
      return null;
    }
    return {subClassOf: value.Object};
  }
  return null;
}

export function IsDataType(t: TTypeName): boolean {
  switch (t.type) {
    case 'SchemaObject':
      return t.name === 'DataType';
    default:
      return false;
  }
}

export function IsDomainIncludes(value: TPredicate): boolean {
  return value.type === 'SchemaObject' && value.name === 'domainIncludes';
}
export function IsRangeIncludes(value: TPredicate): boolean {
  return value.type === 'SchemaObject' && value.name === 'rangeIncludes';
}

export type TTypeName = RdfSchema|RdfSyntax|SchemaObject;
export function GetType(value: ObjectPredicate): TTypeName|null {
  if (value.Predicate.type === 'RdfSntax' && value.Predicate.hash === 'type') {
    if (value.Object.type === 'RdfSchema' || value.Object.type === 'RdfSntax' ||
        value.Object.type === 'SchemaObject') {
      return value.Object;
    }
    throw new Error(`Unexpected type ${value.Object}`);
  }
  return null;
}

export function GetTypes(key: TSubject, values: ReadonlyArray<ObjectPredicate>):
    ReadonlyArray<TTypeName> {
  const types = values.map(GetType).filter((t): t is TTypeName => !!t);

  if (types.length === 0) {
    throw new Error(
        `No type found for Subject ${key.toString()}. Triples include:\n${
            values.map(v => `${v.Predicate.toString()} ${v.Object.toString()}`)
                .join('\n')}`);
  }

  return types;
}

export function EnsureSubject(type: TTypeName): TSubject {
  if (type.type === 'RdfSntax' || type.type === 'RdfSchema') {
    throw new Error(`Expected ${type.toString()} to be a Subject.`);
  }
  return type;
}

export function IsClassType(type: TTypeName): boolean {
  return type.type === 'RdfSchema' && type.hash === 'Class';
}
export function IsPropertyType(type: TTypeName): boolean {
  return type.type === 'RdfSntax' && type.hash === 'Property';
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
