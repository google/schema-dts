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
<http://schema.org/name> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/name> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/name> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/name> <http://www.w3.org/2000/01/rdf-schema#comment> "Simple!" .
<http://schema.org/Thing> <http://www.w3.org/2000/01/rdf-schema#comment> "Simple!" .
<http://schema.org/name> <http://www.w3.org/2000/01/rdf-schema#comment> "Names are great!\\n<br/> <a href=\\"X\\">Y</a>"@en .
<http://schema.org/Thing> <http://www.w3.org/2000/01/rdf-schema#comment> "Things are amazing!\\n\\n<br/><br /><ul><li>Foo</li><li>Bar</li><li><em>Baz</em>, and <strong>Bat</strong></li><ul>"@en .
<http://schema.org/Widget> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/Gadget> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/Gadget> <http://www.w3.org/2000/01/rdf-schema#comment> "Simple!" .
<http://schema.org/Gadget> <http://www.w3.org/2000/01/rdf-schema#comment> "Complex!" .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/DataType> .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
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

export type Text = string;

interface ThingBase extends Partial<IdReference> {
    /**
     * Names are great!
     * {@link X Y}
     */
    \\"name\\"?: SchemaValue<Text>;
}
interface ThingLeaf extends ThingBase {
    \\"@type\\": \\"Thing\\";
}
/**
 * Things are amazing!
 *
 * - Foo
 * - Bar
 * - _Baz_, and __Bat__
 */
export type Thing = \\"http://schema.org/Gadget\\" | \\"https://schema.org/Gadget\\" | \\"Gadget\\" | \\"http://schema.org/Widget\\" | \\"https://schema.org/Widget\\" | \\"Widget\\" | ThingLeaf;

"
`);
  expect(actualLogs).toMatchInlineSnapshot(`
    "Loading Ontology from URL: https://fake.com/duplicate_comments_test.ts.nt
    Got Response 200: Ok.
    Duplicate comments provided on class http://schema.org/Thing. It will be overwritten.
    Duplicate comments provided on property http://schema.org/name. It will be overwritten.
    Duplicate comments provided on http://schema.org/Gadget enum but one already exists. It will be overwritten.
    "
  `);
});
