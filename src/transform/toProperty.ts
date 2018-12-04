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
import {Log} from '../logging';
import {Format, ObjectPredicate, TypedTopic} from '../triples/triple';
import {IsPropertyType} from '../triples/wellKnown';
import {ClassMap} from '../ts/class';
import {PropertyType} from '../ts/property';

export function ProcessProperties(
    topics: ReadonlyArray<TypedTopic>, classes: ClassMap) {
  for (const topic of topics) {
    // Skip Topics that have no 'Property' Type.
    if (!topic.types.some(IsPropertyType)) continue;

    const rest: ObjectPredicate[] = [];
    const property = new PropertyType(topic.Subject);
    for (const value of topic.values) {
      const added = property.add(value, classes);
      if (!added) {
        rest.push(value);
      }
    }
    // Go over RangeIncludes or DomainIncludes:
    if (rest.length > 0) {
      Log(`Still unadded for property: ${topic.Subject.name}:\n\t${
          rest.map(Format).join('\n\t')}`);
    }
  }
}
