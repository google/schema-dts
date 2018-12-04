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
import {Rdfs, SchemaString, UrlNode} from './types';

export interface Triple {
  readonly Subject: UrlNode;
  readonly Predicate: UrlNode;
  readonly Object: UrlNode|SchemaString|Rdfs;
}
export type TSubject = Triple['Subject'];
export type TPredicate = Triple['Predicate'];
export type TObject = Triple['Object'];

export interface ObjectPredicate {
  Object: TObject;
  Predicate: TPredicate;
}

export type TTypeName = UrlNode;

export interface Topic {
  Subject: TSubject;
  values: ReadonlyArray<ObjectPredicate>;
}
export interface TypedTopic extends Topic {
  types: ReadonlyArray<TTypeName>;
}

export function toString(o: Triple|ObjectPredicate): string {
  return ((o as Triple).Subject) ?
      `(${(o as Triple).Subject.name}, ${o.Predicate.name}, ${
          o.Object.toString()})` :
      `(${o.Predicate.name}, ${o.Object.toString()})`;
}
