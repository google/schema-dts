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
import {Rdfs, SchemaString, UrlNode} from './types.js';

/** Represents a parsed Subject-Predicate-Object statement. */
export interface Triple {
  readonly Subject: UrlNode;
  readonly Predicate: UrlNode;
  readonly Object: UrlNode | SchemaString | Rdfs;
}

export type TSubject = Triple['Subject'];
export type TPredicate = Triple['Predicate'];
export type TObject = Triple['Object'];

/**
 * Represents a Predicate and Object corresponding to some Subject.
 *
 * This is used within a 'Topic', where a collection of ObjectPredicate
 * statements all apply to the same Subject.
 */
export interface ObjectPredicate {
  Object: TObject;
  Predicate: TPredicate;
}

/**
 * A Node that can correspond to a "concept" in the ontology (class, property,
 * etc.).
 */
export type TTypeName = UrlNode;

/** A set of statements applying to the same Subject. */
export interface Topic {
  Subject: TSubject;
  values: readonly ObjectPredicate[];
}

/** A Topic annotated by its types. */
export interface TypedTopic extends Topic {
  types: readonly TTypeName[];
}

/** Compact Human-readable format of a Triple of ObjectPredicate. */
export function Format(o: Triple | ObjectPredicate): string {
  return (o as Triple).Subject
    ? `(${(o as Triple).Subject.name}, ${
        o.Predicate.name
      }, ${o.Object.toString()})`
    : `(${o.Predicate.name}, ${o.Object.toString()})`;
}
