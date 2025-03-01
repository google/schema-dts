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
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/DataType> .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/URL> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/URL> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Text> .
<http://schema.org/FancyURL> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/FancyURL> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/URL> .
<http://schema.org/PronounceableText> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/PronounceableText> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Text> .
<http://schema.org/phoneticText> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/phoneticText> <http://schema.org/domainIncludes> <http://schema.org/PronounceableText> .
<http://schema.org/phoneticText> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/ArabicText> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/ArabicText> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/PronounceableText> .
<http://schema.org/arabicPhoneticText> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/arabicPhoneticText> <http://schema.org/domainIncludes> <http://schema.org/ArabicText> .
<http://schema.org/arabicPhoneticText> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/EnglishText> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/EnglishText> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/PronounceableText> .
<http://schema.org/website> <http://schema.org/rangeIncludes> <http://schema.org/URL> .
<http://schema.org/website> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/website> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/pronunciation> <http://schema.org/rangeIncludes> <http://schema.org/PronounceableText> .
<http://schema.org/pronunciation> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/pronunciation> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
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

    export type Text = PronounceableText | URL | string;

    interface ArabicTextBase extends PronounceableTextBase {
        "arabicPhoneticText"?: SchemaValue<Text>;
    }
    interface ArabicTextLeaf extends ArabicTextBase {
        "@type": "ArabicText";
    }
    export type ArabicText = ArabicTextLeaf | string;

    interface EnglishTextLeaf extends PronounceableTextBase {
        "@type": "EnglishText";
    }
    export type EnglishText = EnglishTextLeaf | string;

    export type FancyURL = string;

    interface PronounceableTextBase extends Partial<IdReference> {
        "phoneticText"?: SchemaValue<Text>;
    }
    interface PronounceableTextLeaf extends PronounceableTextBase {
        "@type": "PronounceableText";
    }
    export type PronounceableText = PronounceableTextLeaf | ArabicText | EnglishText | string;

    interface ThingBase extends Partial<IdReference> {
        "name"?: SchemaValue<Text>;
        "pronunciation"?: SchemaValue<PronounceableText | IdReference>;
        "website"?: SchemaValue<URL>;
    }
    interface ThingLeaf extends ThingBase {
        "@type": "Thing";
    }
    export type Thing = ThingLeaf;

    export type URL = FancyURL | string;

    "
  `);
});
