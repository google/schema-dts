/**
 * Copyright 2026 Google LLC
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
 *
 * @fileoverview Regression test for #98: WithContext<T> must strip the `string`
 * members out of T. Every schema type is a union with `string` (e.g.
 * `Organization = OrganizationLeaf | ... | string`), so a bare `T & {...}`
 * leaves a meaningless `string & {"@context": ...}` branch in the result.
 * WithContext is always applied to a top-level object, so we exclude `string`.
 */
import {basename} from 'path';

import {inlineCli} from '../helpers/main_driver.js';

test(`baseline_${basename(import.meta.url)}`, async () => {
  const {actual} = await inlineCli(
    `
<http://schema.org/URL> <http://www.w3.org/2000/01/rdf-schema#comment> "Data type: URL." .
<http://schema.org/URL> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/URL> <http://www.w3.org/2000/01/rdf-schema#label> "URL" .
<http://schema.org/URL> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Text> .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/DataType> .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
      `,
    ['--ontology', `https://fake.com/${basename(import.meta.url)}.nt`],
  );

  expect(actual).toContain(
    'export type WithContext<T extends JsonLdObject | string> = Exclude<T, string> & {',
  );
  // The unfixed form leaks a `string & {"@context"}` branch into the result.
  expect(actual).not.toContain(
    'export type WithContext<T extends JsonLdObject | string> = T & {',
  );
});
