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

import {Format, ObjectPredicate, TypedTopic} from '../triples/triple';
import {HasEnumType} from '../triples/wellKnown';
import {ClassMap} from '../ts/class';
import {EnumValue} from '../ts/enum';

export function ProcessEnums(
    topics: ReadonlyArray<TypedTopic>, classes: ClassMap) {
  // Process Enums
  for (const topic of topics) {
    if (!HasEnumType(topic.types)) continue;

    // Everything Here should be an enum.
    const enumValue = new EnumValue(topic.Subject);
    const skipped: ObjectPredicate[] = [];
    for (const v of topic.values) {
      if (!enumValue.add(v, classes)) skipped.push(v);
    }

    if (skipped.length > 0) {
      console.error(
          `For Enum Item ${topic.Subject.name}, did not process: `,
          skipped.map(Format));
    }
  }
}
