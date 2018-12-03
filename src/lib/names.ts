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
import {TObject, TSubject} from './triple';

export function toClassName(subject: TSubject): string {
  switch (subject.type) {
    case 'SchemaObject':
      return subject.name;
    case 'SchemaSource':
      return 'S_' + subject.hash;
    case 'W3CNameSpaced':
      return subject.ns + '_' + subject.hash;
    case 'OneOffClass':
      return subject.className;
    default:
      const shouldBeNever: never = subject;
      return shouldBeNever;
  }
}

export function toTypeName(object: TObject): string {
  switch (object.type) {
    case 'SchemaObject':
    case 'SchemaSource':
    case 'W3CNameSpaced':
      return toClassName(object);
    case 'SchemaString':
      return `"${object.value}"`;  // Without @lang tag, even if present.
    case 'RdfSchema':
    case 'RdfSntax':
    case 'Rdfs':
    case 'WikidataConst':
      throw new Error('Not sure yet about ' + JSON.stringify(object));
    default:
      throw new Error(`Unrecognized ${JSON.stringify(object)}`);
  }
}

export function toScopedName(subject: TSubject): string {
  switch (subject.type) {
    case 'SchemaObject':
      return subject.name;
    case 'SchemaSource':
      return subject.hash;
    case 'W3CNameSpaced':
      return subject.hash;
    case 'OneOffClass':
      return subject.className;
    default:
      const shouldBeNever: never = subject;
      return shouldBeNever;
  }
}

export function toEnumName(subject: TSubject): string {
  return toScopedName(subject).replace(/[^A-Za-z0-9_]/g, '_');
}
