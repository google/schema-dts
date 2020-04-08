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

import {
  CustomOntology,
  IsCustom,
  ParseFlags,
  StandardOntology,
} from '../../src/cli/args';

describe('ParseFlags', () => {
  it('defaults', () => {
    const options = ParseFlags([])!;
    expect(options).not.toBeUndefined();
    expect(options.context).toBe('https://schema.org');
    expect(options.deprecated).toBe(true);
    expect(options.verbose).toBe(false);
    expect(IsCustom(options)).toBe(false);

    const standard = options as StandardOntology;
    expect(standard.layer).toBe('all-layers');
    expect(standard.schema).toBe('latest');
  });

  it('custom ontology', () => {
    const options = ParseFlags(['--ontology', 'https://google.com/foo'])!;
    expect(options).not.toBeUndefined();
    expect(IsCustom(options)).toBe(true);

    const custom = options as CustomOntology;
    expect(custom.ontology).toBe('https://google.com/foo');
  });
});
