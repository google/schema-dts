/**
 * Copyright 2023 Google LLC
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
import {NamedNode, Quad} from 'n3';
import {shortStr} from '../index.js';
import {Log} from '../logging/index.js';

import {IsPropertyType, TypedTopic} from '../triples/wellKnown.js';
import {ClassMap} from '../ts/class.js';
import {PropertyType} from '../ts/property.js';
import {assertIs} from '../util/assert.js';

/**
 * Annotates classes with any Property values they blong to.
 *
 * @param topics a sequence of processed triples describing an Ontology.
 * @param classes return value of `ProcessClasses`.
 */
export function ProcessProperties(
  topics: readonly TypedTopic[],
  classes: ClassMap,
) {
  for (const topic of topics) {
    // Skip Topics that have no 'Property' Type.
    if (!topic.types.some(IsPropertyType)) continue;

    const rest: Quad[] = [];
    assertIs(topic.subject, (s): s is NamedNode => s.termType === 'NamedNode');
    const property = new PropertyType(topic.subject);
    for (const value of topic.quads) {
      const added = property.add(value, classes);
      if (!added) {
        rest.push(value);
      }
    }
    // Go over RangeIncludes or DomainIncludes:
    if (rest.length > 0) {
      Log(
        `Still unadded for property: ${shortStr(topic.subject)}:\n\t${rest
          .map(q => `(${shortStr(q.predicate)} ${shortStr(q.object)})`)
          .join('\n\t')}`,
      );
    }
  }
}
