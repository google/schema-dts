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
<https://schema.org/name> <https://schema.org/rangeIncludes> <https://schema.org/Text> .
<https://schema.org/name> <https://schema.org/domainIncludes> <https://schema.org/Thing> .
<https://schema.org/name> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<https://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/height> <https://schema.org/rangeIncludes> <https://schema.org/Quantity> .
<https://schema.org/height> <https://schema.org/domainIncludes> <https://schema.org/Person> .
<https://schema.org/height> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<https://schema.org/Person> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/Person> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <https://schema.org/Thing> .
<https://schema.org/Quantity> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/Quantity> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <https://schema.org/Thing> .
<https://schema.org/Organization> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/Organization> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <https://schema.org/Thing> .
<https://schema.org/Place> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/Place> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <https://schema.org/Thing> .
<https://schema.org/owner> <https://schema.org/rangeIncludes> <https://schema.org/Person> .
<https://schema.org/owner> <https://schema.org/domainIncludes> <https://schema.org/Organization> .
<https://schema.org/owner> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<https://schema.org/locatedIn> <https://schema.org/rangeIncludes> <https://schema.org/Place> .
<https://schema.org/locatedIn> <https://schema.org/domainIncludes> <https://schema.org/Organization> .
<https://schema.org/locatedIn> <https://schema.org/domainIncludes> <https://schema.org/Person> .
<https://schema.org/locatedIn> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<https://schema.org/EntryPoint> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/EntryPoint> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <https://schema.org/Thing> .
<https://schema.org/urlTemplate> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<https://schema.org/urlTemplate> <https://schema.org/rangeIncludes> <https://schema.org/URL> .
<https://schema.org/URL> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/URL> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <https://schema.org/Text> .
<https://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://schema.org/DataType> .
<https://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/urlTemplate> <https://schema.org/domainIncludes> <https://schema.org/Organization> .
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

    export type Text = URL | string;

    interface EntryPointLeaf extends ThingBase {
        "@type": "EntryPoint";
    }
    export type EntryPoint = EntryPointLeaf | string;

    interface OrganizationBase extends ThingBase {
        "locatedIn"?: SchemaValue<Place | IdReference>;
        "owner"?: SchemaValue<Person | IdReference>;
        "urlTemplate"?: SchemaValue<URL>;
    }
    interface OrganizationLeaf extends OrganizationBase {
        "@type": "Organization";
    }
    export type Organization = OrganizationLeaf | string;

    interface PersonBase extends ThingBase {
        "height"?: SchemaValue<Quantity | IdReference>;
        "locatedIn"?: SchemaValue<Place | IdReference>;
    }
    interface PersonLeaf extends PersonBase {
        "@type": "Person";
    }
    export type Person = PersonLeaf | string;

    interface PlaceLeaf extends ThingBase {
        "@type": "Place";
    }
    export type Place = PlaceLeaf | string;

    interface QuantityLeaf extends ThingBase {
        "@type": "Quantity";
    }
    export type Quantity = QuantityLeaf | string;

    interface ThingBase extends Partial<IdReference> {
        "name"?: SchemaValue<Text>;
    }
    interface ThingLeaf extends ThingBase {
        "@type": "Thing";
    }
    export type Thing = ThingLeaf | EntryPoint | Organization | Person | Place | Quantity;

    export type URL = string;

    "
  `);
});
