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
import {Rdfs, RdfSchema, RdfSyntax, SchemaObject, SchemaSource, SchemaString, W3CNameSpaced, W3cSkos, WikidataConst} from './types';

export interface Triple {
  readonly Subject: SchemaObject|SchemaSource|W3CNameSpaced;
  readonly Predicate: RdfSchema|RdfSyntax|SchemaObject|W3cSkos;
  readonly Object:|SchemaObject|SchemaSource|SchemaString|RdfSchema|RdfSyntax|
      Rdfs|WikidataConst|W3CNameSpaced;
}
export type TSubject = Triple['Subject'];
export type TPredicate = Triple['Predicate'];
export type TObject = Triple['Object'];

export interface ObjectPredicate {
  Object: TObject;
  Predicate: TPredicate;
}
