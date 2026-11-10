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

test(`baseline_${basename(import.meta.url)}`, async () => {
  const {actual} = await inlineCli(
    `
<https://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://schema.org/DataType> .
<https://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/Intangible> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/Intangible> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <https://schema.org/Thing> .
<https://schema.org/PropertyValueSpecification> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/PropertyValueSpecification> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <https://schema.org/Intangible> .
<https://schema.org/Action> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/Action> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <https://schema.org/Thing> .
<https://schema.org/query> <https://schema.org/rangeIncludes> <https://schema.org/Text> .
<https://schema.org/query> <https://schema.org/domainIncludes> <https://schema.org/Action> .
<https://schema.org/query> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
      `,
    ['--ontology', `https://fake.com/${basename(import.meta.url)}.nt`],
  );

  expect(actual).toMatchInlineSnapshot(`
"import type { JsonLdObject, IdReference, MergeLeafTypes } from "schema-dts-lib";
export type { JsonLdObject, IdReference, MergeLeafTypes };
/** Used at the top-level node to indicate the context for the JSON-LD objects used. The context provided in this type is compatible with the keys and URLs in the rest of this generated file. */
export type WithContext<T extends JsonLdObject | string> = T & {
    "@context": "https://schema.org";
};
export interface Graph {
    "@context": "https://schema.org";
    "@graph": readonly Thing[];
}
type SchemaValue<T> = T | readonly T[];
type InputActionConstraints<T extends ActionBase> = Partial<{
    [K in Exclude<keyof T, \`@\${string}\`> as \`\${string & K}-input\`]: PropertyValueSpecification | string;
}>;
type OutputActionConstraints<T extends ActionBase> = Partial<{
    [K in Exclude<keyof T, \`@\${string}\`> as \`\${string & K}-output\`]: PropertyValueSpecification | string;
}>;
/** Provides input and output action constraints for an action. */
export type WithActionConstraints<T extends ActionBase> = T & InputActionConstraints<T> & OutputActionConstraints<T>;

export type Text = string;

interface ActionBase extends ThingBase {
    "query"?: SchemaValue<Text>;
}
export interface ActionLeaf extends ActionBase {
    "@type": "Action";
}
export type Action = ActionLeaf;

export interface IntangibleLeaf extends ThingBase {
    "@type": "Intangible";
}
export type Intangible = IntangibleLeaf | PropertyValueSpecification;

export interface PropertyValueSpecificationLeaf extends ThingBase {
    "@type": "PropertyValueSpecification";
}
export type PropertyValueSpecification = PropertyValueSpecificationLeaf;

interface ThingBase extends Partial<IdReference> {
}
export interface ThingLeaf extends ThingBase {
    "@type": "Thing";
}
export type Thing = ThingLeaf | Action | Intangible;

"
`);
});
