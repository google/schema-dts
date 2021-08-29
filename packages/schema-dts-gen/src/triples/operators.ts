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
import {OperatorFunction} from 'rxjs';
import {groupBy, map, mergeMap, toArray} from 'rxjs/operators';

import {Topic, Triple, TypedTopic} from './triple.js';
import {GetTypes, IsType} from './wellKnown.js';

function groupBySubject(): OperatorFunction<Triple, Topic> {
  return observable =>
    observable.pipe(
      groupBy(triple => triple.Subject.toString()),
      mergeMap(group =>
        group.pipe(
          toArray(),
          map(array => ({
            Subject: array[0].Subject, // All are the same
            values: array.map(({Object, Predicate}) => ({
              Predicate,
              Object,
            })),
          }))
        )
      )
    );
}

function asTopic(): OperatorFunction<Topic, TypedTopic> {
  return map(bySubject => ({
    Subject: bySubject.Subject,
    types: GetTypes(bySubject.Subject, bySubject.values),
    values: bySubject.values.filter(value => !IsType(value.Predicate)),
  }));
}

export function asTopicArray(): OperatorFunction<Triple, TypedTopic[]> {
  return observable => observable.pipe(groupBySubject(), asTopic(), toArray());
}
