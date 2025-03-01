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
<http://schema.org/name> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/name> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/name> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Quantity> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Intangible> .
<http://schema.org/Distance> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Quantity> .
<http://schema.org/Duration> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Quantity> .
<http://schema.org/Mass> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Quantity> .
<http://schema.org/Quantity> <http://www.w3.org/2000/01/rdf-schema#label> "Quantity" .
<http://schema.org/Quantity> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Energy> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Quantity> .
<http://schema.org/Intangible> <http://www.w3.org/2000/01/rdf-schema#label> "Intangible" .
<http://schema.org/Intangible> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Intangible> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/Distance> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Duration> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Mass> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Energy> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/DataType> .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
      `,
    ['--ontology', `https://fake.com/${basename(import.meta.url)}.nt`],
  );

  expect(actual).toMatchInlineSnapshot(`
    "/** Used at the top-level node to indicate the context for the JSON-LD objects used. The context provided in this type is compatible with the keys and URLs in the rest of this generated file. */
    export type WithContext<T extends Thing> = T & {
        "@context": "https://schema.org";
    };
    export interface Graph {
        "@context": "https://schema.org";
        "@graph": readonly Thing[];
    }
    type SchemaValue<T> = T | readonly T[];
    type IdReference = {
        /** IRI identifying the canonical address of this object. */
        "@id": string;
    };

    export type Text = string;

    interface DistanceLeaf extends ThingBase {
        "@type": "Distance";
    }
    export type Distance = DistanceLeaf | string;

    interface DurationLeaf extends ThingBase {
        "@type": "Duration";
    }
    export type Duration = DurationLeaf | string;

    interface EnergyLeaf extends ThingBase {
        "@type": "Energy";
    }
    export type Energy = EnergyLeaf | string;

    interface IntangibleLeaf extends ThingBase {
        "@type": "Intangible";
    }
    export type Intangible = IntangibleLeaf | Quantity;

    interface MassLeaf extends ThingBase {
        "@type": "Mass";
    }
    export type Mass = MassLeaf | string;

    interface QuantityLeaf extends ThingBase {
        "@type": "Quantity";
    }
    export type Quantity = QuantityLeaf | Distance | Duration | Energy | Mass | string;

    interface ThingBase extends Partial<IdReference> {
        "name"?: SchemaValue<Text>;
    }
    interface ThingLeaf extends ThingBase {
        "@type": "Thing";
    }
    export type Thing = ThingLeaf | Intangible;

    "
  `);
});
