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

import {Log} from '../logging/index.js';

import {
  IsDirectlyNamedClass,
  IsDataType,
  ClassIsDataType,
  IsSubclass,
  TypedTopic,
} from '../triples/wellKnown.js';
import {
  AliasBuiltin,
  Class,
  ClassMap,
  DataTypeUnion,
  RoleBuiltin,
} from '../ts/class.js';
import {assert, assertIs} from '../util/assert.js';

import type {Quad} from 'n3';
import {NamedNode} from 'n3';
import {shortStr} from '../index.js';

function toClass(cls: Class, topic: TypedTopic, map: ClassMap): Class {
  const rest: Quad[] = [];

  for (const value of topic.quads) {
    const added = cls.add(value, map);
    if (!added) rest.push(value);
  }

  if (rest.length > 0) {
    Log(
      `Class ${shortStr(cls.subject)}: Did not add [${rest
        .map(r => `(${shortStr(r.predicate)} ${shortStr(r.object)})`)
        .join(',')}]`,
    );
  }
  return cls;
}

function buildAlias(name: string, alias: string): AliasBuiltin[] {
  return [
    new AliasBuiltin(
      new NamedNode(`http://schema.org/${name}`),
      AliasBuiltin.Alias(alias),
    ),
    new AliasBuiltin(
      new NamedNode(`https://schema.org/${name}`),
      AliasBuiltin.Alias(alias),
    ),
  ];
}
const wellKnownTypes = [
  ...buildAlias('Text', 'string'),
  // IMPORTANT: In the future, if possible, we should have: `${number}` in Float only,
  // an integer string literal in Integer only, and Number becomes simply Float|Integer.
  new AliasBuiltin(
    new NamedNode('http://schema.org/Number'),
    AliasBuiltin.Alias('number'),
    AliasBuiltin.NumberStringLiteral(),
  ),
  new AliasBuiltin(
    new NamedNode('https://schema.org/Number'),
    AliasBuiltin.Alias('number'),
    AliasBuiltin.NumberStringLiteral(),
  ),
  ...buildAlias('Time', 'string'),
  ...buildAlias('Date', 'string'),
  ...buildAlias('DateTime', 'string'),
  ...buildAlias('Boolean', 'boolean'),
  new RoleBuiltin(new NamedNode('http://schema.org/Role')),
  new RoleBuiltin(new NamedNode('http://schema.org/OrganizationRole')),
  new RoleBuiltin(new NamedNode('http://schema.org/EmployeeRole')),
  new RoleBuiltin(new NamedNode('http://schema.org/LinkRole')),
  new RoleBuiltin(new NamedNode('http://schema.org/PerformanceRole')),
  new RoleBuiltin(new NamedNode('https://schema.org/Role')),
  new RoleBuiltin(new NamedNode('https://schema.org/OrganizationRole')),
  new RoleBuiltin(new NamedNode('https://schema.org/EmployeeRole')),
  new RoleBuiltin(new NamedNode('https://schema.org/LinkRole')),
  new RoleBuiltin(new NamedNode('https://schema.org/PerformanceRole')),
];

// Should we allow 'string' to be a valid type for all values of this type?
const wellKnownStrings = [
  new NamedNode('http://schema.org/Quantity'),
  new NamedNode('http://schema.org/EntryPoint'),
  new NamedNode('http://schema.org/Organization'),
  new NamedNode('http://schema.org/Person'),
  new NamedNode('http://schema.org/Place'),
  new NamedNode('https://schema.org/Quantity'),
  new NamedNode('https://schema.org/EntryPoint'),
  new NamedNode('https://schema.org/Organization'),
  new NamedNode('https://schema.org/Person'),
  new NamedNode('https://schema.org/Place'),
];

function ForwardDeclareClasses(topics: readonly TypedTopic[]): ClassMap {
  const classes = new Map<string, Class>();
  const dataType = new DataTypeUnion(
    new NamedNode('http://schema.org/DataType'),
    [],
  );

  for (const topic of topics) {
    if (IsDataType(topic.subject)) {
      classes.set(topic.subject.value, dataType);
      continue;
    } else if (!IsDirectlyNamedClass(topic) && !IsSubclass(topic)) continue;

    const wk = wellKnownTypes.find(wk => wk.subject.equals(topic.subject));
    if (ClassIsDataType(topic)) {
      assert(
        wk,
        `${topic.subject.value} must have corresponding well-known type.`,
      );
      dataType.wk.push(wk);

      wk['_isDataType'] = true;
    }

    assertIs(topic.subject, (s): s is NamedNode => s.termType === 'NamedNode');
    const cls = wk || new Class(topic.subject);
    const allowString = wellKnownStrings.some(wks => wks.equals(topic.subject));
    if (allowString) cls.addTypedef(AliasBuiltin.Alias('string'));
    if (IsDirectlyNamedClass(topic)) cls.markAsExplicitClass();

    classes.set(topic.subject.value, cls);
  }

  return classes;
}

function BuildClasses(topics: readonly TypedTopic[], classes: ClassMap) {
  for (const topic of topics) {
    if (!IsDirectlyNamedClass(topic) && !IsSubclass(topic)) continue;

    const cls = classes.get(topic.subject.value);
    assert(cls);
    toClass(cls, topic, classes);
  }

  for (const cls of classes.values()) {
    cls.validateClass();
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
