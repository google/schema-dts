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
 *
 * @fileoverview Baseline tests are a set of tests (in tests/baseline/) that
 * correspond to full comparisons of a generate .ts output based on a set of
 * Triples representing an entire ontology.
 */
import {basename} from 'path';

import {inlineCli} from '../helpers/main_driver.js';

test(`invalidSyntax_${basename(import.meta.url)}`, async () => {
  const run = inlineCli(
    `
 <"INVALID> <http://www.w3.org/1999/02/22-rdf-s> "X" .
       `,
    ['--ontology', `https://fake.com/${basename(import.meta.url)}.nt`],
  );

  await expect(run).rejects.toThrowError('Unexpected');
});

test(`unnamedURLClass_${basename(import.meta.url)}`, async () => {
  const run = inlineCli(
    `
 <http://schema.org/> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
       `,
    ['--ontology', `https://fake.com/${basename(import.meta.url)}.nt`],
  );

  await expect(run).rejects.toThrowError('to have a short name');
});

test(`notMarkedAsClass_cycle_${basename(import.meta.url)}`, async () => {
  const run = inlineCli(
    `
 <http://schema.org/name> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
 <http://schema.org/name> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
 <http://schema.org/name> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
 <http://schema.org/Thing> <http://www.w3.org/2000/01/rdf-schema#comment> "ABC" .
 <http://schema.org/Thing> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Person> .
 <http://schema.org/Person> <http://www.w3.org/2000/01/rdf-schema#comment> "ABC" .
 <http://schema.org/Person> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
 <http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/DataType> .
 <http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
 <http://schema.org/Text> <http://www.w3.org/2000/01/rdf-schema#comment> "Data type: Text." .
       `,
    ['--ontology', `https://fake.com/${basename(import.meta.url)}.nt`],
  );

  await expect(run).rejects.toThrowError(
    'Thing is not marked as an rdfs:Class',
  );
});
