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
 *
 * @fileoverview Baseline tests are a set of tests (in tests/baseline/) that
 * correspond to full comparisons of a generate .ts output based on a set of
 * Triples representing an entire ontology.
 */
import {basename} from 'path';

import {inlineCli} from '../helpers/main_driver.js';

test(`baseline_${basename(import.meta.url)}`, async () => {
  const {actual, actualLogs} = await inlineCli(
    `
<http://schema.org/b> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/a> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/c> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/d> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<https://schema.org/e> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://google.com/f> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/c> <http://www.w3.org/2000/01/rdf-schema#comment> "A letter!" .
<http://schema.org/c> <http://schema.org/category> "issue-1156" .
<http://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Thing> <http://www.w3.org/2000/01/rdf-schema#comment> "A Thing!" .
`,
    [
      '--ontology',
      `https://fake.com/${basename(import.meta.url)}.nt`,
      `--verbose`,
    ]
  );

  expect(actual).toMatchInlineSnapshot(`
"/** Used at the top-level node to indicate the context for the JSON-LD objects used. The context provided in this type is compatible with the keys and URLs in the rest of this generated file. */
export type WithContext<T extends Thing> = T & {
    \\"@context\\": \\"https://schema.org\\";
};
export interface Graph {
    \\"@context\\": \\"https://schema.org\\";
    \\"@graph\\": readonly Thing[];
}
type SchemaValue<T> = T | readonly T[];
type IdReference = {
    /** IRI identifying the canonical address of this object. */
    \\"@id\\": string;
};

interface ThingBase extends Partial<IdReference> {
}
interface ThingLeaf extends ThingBase {
    \\"@type\\": \\"Thing\\";
}
/** A Thing! */
export type Thing = \\"http://schema.org/a\\" | \\"https://schema.org/a\\" | \\"a\\" | \\"http://schema.org/b\\" | \\"https://schema.org/b\\" | \\"b\\" | \\"http://schema.org/c\\" | \\"https://schema.org/c\\" | \\"c\\" | \\"http://schema.org/d\\" | \\"https://schema.org/d\\" | \\"d\\" | \\"https://schema.org/e\\" | \\"e\\" | \\"http://google.com/f\\" | \\"https://google.com/f\\" | ThingLeaf;

"
`);
  expect(actualLogs).toMatchInlineSnapshot(`
    "Loading Ontology from URL: https://fake.com/enum_skipped_test.ts.nt
    Got Response 200: Ok.
    For Enum Item c, did not process:
    	(category, issue-1156)
    "
  `);
});
