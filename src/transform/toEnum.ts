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

import {Log} from '../logging/index.js';
import {Format, ObjectPredicate, TypedTopic} from '../triples/triple.js';
import {HasEnumType} from '../triples/wellKnown.js';
import {ClassMap} from '../ts/class.js';
import {EnumValue} from '../ts/enum.js';

/**
 * Annotates classes with any Enum values they blong to.
 *
 * @param topics a sequence of processed triples describing an Ontology.
 * @param classes return value of `ProcessClasses`.
 */
export function ProcessEnums(topics: readonly TypedTopic[], classes: ClassMap) {
  // Process Enums
  for (const topic of topics) {
    if (!HasEnumType(topic.types)) continue;

    // Everything Here should be an enum.
    const enumValue = new EnumValue(topic.Subject, topic.types, classes);

    const skipped: ObjectPredicate[] = [];
    for (const v of topic.values) {
      if (!enumValue.add(v)) skipped.push(v);
    }

    if (skipped.length > 0) {
      Log(
        `For Enum Item ${topic.Subject.name}, did not process:\n\t${skipped
          .map(Format)
          .join('\n\t')}`
      );
    }
  }
}
