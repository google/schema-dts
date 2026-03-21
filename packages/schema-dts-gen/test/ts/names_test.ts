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
import {NamedNode} from 'n3';
import {toClassName} from '../../src/ts/util/names.js';
import {Context} from '../../src/ts/context.js';

function parseNamed(url: string) {
  return new NamedNode(url);
}

function regularContext() {
  const c = new Context();
  c.setUrlContext('https://schema.org/');
  return c;
}

describe('toClassName', () => {
  it('operates normally, with typical inputs', () => {
    expect(
      toClassName(parseNamed('https://schema.org/Person'), regularContext()),
    ).toBe('Person');
    expect(
      toClassName(parseNamed('https://schema.org/Person3'), regularContext()),
    ).toBe('Person3');
    expect(
      toClassName(parseNamed('http://schema.org/Person'), regularContext()),
    ).toBe('Person');
    expect(
      toClassName(
        parseNamed('http://schema.org/Organization4Organization'),
        regularContext(),
      ),
    ).toBe('Organization4Organization');
  });

  it('handles illegal TypeScript identifier characters', () => {
    expect(
      toClassName(parseNamed('https://schema.org/Person-4'), regularContext()),
    ).toBe('Person_4');
    expect(
      toClassName(parseNamed('https://schema.org/Person%4'), regularContext()),
    ).toBe('Person_4');
    expect(
      toClassName(
        parseNamed('https://schema.org/Person%204'),
        regularContext(),
      ),
    ).toBe('Person_4');
    expect(
      toClassName(parseNamed('https://schema.org/Person, 4'), regularContext()),
    ).toBe('Person__4');

    expect(
      toClassName(parseNamed('https://schema.org/3DModel'), regularContext()),
    ).toBe('_3DModel');
    expect(
      toClassName(parseNamed('https://schema.org/3DModel-5'), regularContext()),
    ).toBe('_3DModel_5');
  });

  it('handles out-of-context class names', () => {
    expect(
      toClassName(parseNamed('https://example.com/Person'), regularContext()),
    ).toBe('example_com_Person');
    expect(
      toClassName(
        parseNamed('https://example.com/schemas#Person'),
        regularContext(),
      ),
    ).toBe('example_com_schemas_Person');
  });
});
