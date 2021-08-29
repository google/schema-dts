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

import {Format, ObjectPredicate, Triple} from '../../src/triples/triple.js';
import {Rdfs, SchemaString, UrlNode} from '../../src/triples/types.js';

describe('Format(Triple)', () => {
  it('smoke test 1', () => {
    const triple: Triple = {
      Subject: UrlNode.Parse('https://schema.org/Person'),
      Predicate: UrlNode.Parse('https://schema.org/knowsAbout'),
      Object: SchemaString.Parse('"food"')!,
    };

    expect(Format(triple)).toBe('(Person, knowsAbout, "food")');
  });

  it('smoke test 2', () => {
    const triple: Triple = {
      Subject: UrlNode.Parse('https://schema.org/Organization'),
      Predicate: UrlNode.Parse('https://schema.org/knowsAbout'),
      Object: Rdfs.Parse('rdfs:Class')!,
    };

    expect(Format(triple)).toBe('(Organization, knowsAbout, rdfs:Class)');
  });
});

describe('Format(ObjectPredicate)', () => {
  it('smoke test 1', () => {
    const triple: ObjectPredicate = {
      Predicate: UrlNode.Parse('https://schema.org/knowsAbout'),
      Object: SchemaString.Parse('"food"')!,
    };

    expect(Format(triple)).toBe('(knowsAbout, "food")');
  });

  it('smoke test 2', () => {
    const triple: ObjectPredicate = {
      Predicate: UrlNode.Parse('https://schema.org/knowsAbout'),
      Object: Rdfs.Parse('rdfs:Class')!,
    };

    expect(Format(triple)).toBe('(knowsAbout, rdfs:Class)');
  });
});
