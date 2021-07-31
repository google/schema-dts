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

import {Log} from '../logging';
import {ObjectPredicate, Topic, TypedTopic} from '../triples/triple';
import {UrlNode} from '../triples/types';
import {IsNamedClass, IsWellKnown, IsDataType} from '../triples/wellKnown';
import {AliasBuiltin, Class, ClassMap, DataTypeUnion} from '../ts/class';
import {assert} from '../util/assert';

function toClass(cls: Class, topic: Topic, map: ClassMap): Class {
  const rest: ObjectPredicate[] = [];
  for (const value of topic.values) {
    const added = cls.add(value, map);
    if (!added) rest.push(value);
  }

  if (rest.length > 0) {
    Log(
      `Class ${cls.subject.name}: Did not add [${rest
        .map(r => `(${r.Predicate.name} ${r.Object.toString()})`)
        .join(',')}]`
    );
  }
  return cls;
}

const wellKnownTypes = [
  new AliasBuiltin('http://schema.org/Text', AliasBuiltin.Alias('string')),
  // IMPORTANT: In the future, if possible, we should have: `${number}` in Float only,
  // an integer string literal in Integer only, and Number becomes simply Float|Integer.
  new AliasBuiltin(
    'http://schema.org/Number',
    AliasBuiltin.Alias('number'),
    AliasBuiltin.NumberStringLiteral()
  ),
  new AliasBuiltin('http://schema.org/Time', AliasBuiltin.Alias('string')),
  new AliasBuiltin('http://schema.org/Date', AliasBuiltin.Alias('string')),
  new AliasBuiltin('http://schema.org/DateTime', AliasBuiltin.Alias('string')),
  new AliasBuiltin('http://schema.org/Boolean', AliasBuiltin.Alias('boolean')),
];

// Should we allow 'string' to be a valid type for all values of this type?
const wellKnownStrings = [
  UrlNode.Parse('http://schema.org/Quantity'),
  UrlNode.Parse('http://schema.org/EntryPoint'),
  UrlNode.Parse('http://schema.org/Organization'),
  UrlNode.Parse('http://schema.org/Person'),
  UrlNode.Parse('http://schema.org/Place'),
  UrlNode.Parse('https://schema.org/Quantity'),
  UrlNode.Parse('https://schema.org/EntryPoint'),
  UrlNode.Parse('https://schema.org/Organization'),
  UrlNode.Parse('https://schema.org/Person'),
  UrlNode.Parse('https://schema.org/Place'),
];

function ForwardDeclareClasses(topics: readonly TypedTopic[]): ClassMap {
  const classes = new Map<string, Class>();
  const dataType = new DataTypeUnion('http://schema.org/DataType', []);

  for (const topic of topics) {
    if (IsDataType(topic.Subject)) {
      classes.set(topic.Subject.toString(), dataType);
      continue;
    } else if (IsWellKnown(topic)) {
      const wk = wellKnownTypes.find(wk => wk.subject.equivTo(topic.Subject));
      if (!wk) {
        throw new Error(
          `Non-Object type ${topic.Subject.toString()} has no corresponding well-known type.`
        );
      }
      classes.set(topic.Subject.toString(), wk);
      dataType.wk.push(wk);
      continue;
    } else if (!IsNamedClass(topic)) continue;

    const cls = new Class(topic.Subject);
    const allowString = wellKnownStrings.some(wks =>
      wks.equivTo(topic.Subject)
    );
    if (allowString) cls.addTypedef(AliasBuiltin.Alias('string'));

    classes.set(topic.Subject.toString(), cls);
  }

  return classes;
}

function BuildClasses(topics: readonly TypedTopic[], classes: ClassMap) {
  for (const topic of topics) {
    if (!IsNamedClass(topic)) continue;

    const cls = classes.get(topic.Subject.toString());
    assert(cls);
    toClass(cls, topic, classes);
  }
}

/**
 * Produce a mapping of all Classes within the Ontology. The resulting classes
 * are empty and only describes their names, comments, and inheritance
 * relations.
 *
 * @param topics a sequence of processed triples describing an Ontology.
 * @returns ClassMap Mapping fully qualified ID of each type to a Class.
 */
export function ProcessClasses(topics: readonly TypedTopic[]): ClassMap {
  const classes = ForwardDeclareClasses(topics);
  BuildClasses(topics, classes);
  return classes;
}
