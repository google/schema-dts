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

import {ok} from 'assert';

import {Log} from '../logging';
import {ObjectPredicate, Topic, TypedTopic} from '../triples/triple';
import {UrlNode} from '../triples/types';
import {IsClass} from '../triples/wellKnown';
import {BooleanEnum, Builtin, Class, ClassMap, DataTypeUnion} from '../ts/class';

const assert: <T>(item: T|undefined) => asserts item is T = ok;

function toClass(cls: Class, topic: Topic, map: ClassMap): Class {
  const rest: ObjectPredicate[] = [];
  for (const value of topic.values) {
    const added = cls.add(value, map);
    if (!added) rest.push(value);
  }

  if (rest.length > 0) {
    Log(`Class ${cls.subject.name}: Did not add [${
        rest.map(r => `(${r.Predicate.name} ${r.Object.toString()})`)
            .join(',')}]`);
  }
  return cls;
}

const wellKnownTypes = [
  new Builtin('http://schema.org/Text', 'string', 'Data type: Text.'),
  new Builtin('http://schema.org/Number', 'number', 'Data type: Number.'),
  new Builtin(
      'http://schema.org/Time', 'string',
      'DateTime represented in string, e.g. 2017-01-04T17:10:00-05:00.'),
  new Builtin(
      'http://schema.org/Date', 'string',
      'A date value in <a href=\"http://en.wikipedia.org/wiki/ISO_8601\">' +
          'ISO 8601 date format</a>.'),
  new Builtin(
      'http://schema.org/DateTime', 'string',
      'A combination of date and time of day in the form ' +
          '[-]CCYY-MM-DDThh:mm:ss[Z|(+|-)hh:mm] ' +
          '(see Chapter 5.4 of ISO 8601).'),
  new BooleanEnum(
      'http://schema.org/Boolean', 'https://schema.org/True',
      'https://schema.org/False', 'Boolean: True or False.'),
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

const dataType = new DataTypeUnion(
    'http://schema.org/DataType', wellKnownTypes,
    'The basic data types such as Integers, Strings, etc.');

function ForwardDeclareClasses(topics: ReadonlyArray<TypedTopic>): ClassMap {
  const classes = new Map<string, Class>();
  for (const wk of wellKnownTypes) {
    classes.set(wk.subject.toString(), wk);
  }
  classes.set(dataType.subject.toString(), dataType);
  for (const topic of topics) {
    if (!IsClass(topic)) continue;

    const allowString = wellKnownStrings.some(wks => wks.equals(topic.Subject));
    classes.set(
        topic.Subject.toString(), new Class(topic.Subject, allowString));
  }

  return classes;
}

function BuildClasses(topics: ReadonlyArray<TypedTopic>, classes: ClassMap) {
  for (const topic of topics) {
    if (!IsClass(topic)) continue;

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
export function ProcessClasses(topics: ReadonlyArray<TypedTopic>): ClassMap {
  const classes = ForwardDeclareClasses(topics);
  BuildClasses(topics, classes);
  return classes;
}
