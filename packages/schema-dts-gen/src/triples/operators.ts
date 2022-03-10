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

import type {ObjectPredicate, Topic, Triple, TypedTopic} from './triple.js';
import {GetTypes, IsType} from './wellKnown.js';

function asTopics(triples: Triple[]): Topic[] {
  interface MutableTopic extends Topic {
    values: ObjectPredicate[];
  }
  const map = new Map<string, MutableTopic>();

  for (const triple of triples) {
    const subjectKey = triple.Subject.toString();
    let topic = map.get(subjectKey);
    if (!topic) {
      topic = {
        Subject: triple.Subject,
        values: [],
      };
      map.set(subjectKey, topic);
    }
    topic.values.push({Object: triple.Object, Predicate: triple.Predicate});
  }

  return Array.from(map.values());
}

function asTypedTopic(topic: Topic): TypedTopic {
  return {
    Subject: topic.Subject,
    types: GetTypes(topic.Subject, topic.values),
    values: topic.values.filter(value => !IsType(value.Predicate)),
  };
}

export function asTopicArray(triples: Triple[]): TypedTopic[] {
  return asTopics(triples).map(asTypedTopic);
}
