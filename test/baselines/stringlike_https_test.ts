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
 *
 * @fileoverview Baseline tests are a set of tests (in tests/baseline/) that
 * correspond to full comparisons of a generate .ts output based on a set of
 * Triples representing an entire ontology.
 */
import {basename} from 'path';

import {inlineCli} from '../helpers/main_driver';

test(`baseine_${basename(__filename)}`, async () => {
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
<https://schema.org/urlTemplate> <https://schema.org/domainIncludes> <https://schema.org/Organization> .
      `,
    ['--ontology', `https://fake.com/${basename(__filename)}.nt`]
  );

  expect(actual).toMatchInlineSnapshot(`
    "// tslint:disable

    /** Used at the top-level node to indicate the context for the JSON-LD objects used. The context provided in this type is compatible with the keys and URLs in the rest of this generated file. */
    export type WithContext<T extends Thing> = T & {
        \\"@context\\": \\"https://schema.org\\";
    };

    /** Boolean: True or False. */
    export type Boolean = true | false | \\"https://schema.org/True\\" | \\"https://schema.org/False\\";
    export const Boolean = {
        True: (\\"https://schema.org/True\\" as const),
        False: (\\"https://schema.org/False\\" as const)
    };

    /** A date value in {@link http://en.wikipedia.org/wiki/ISO_8601 ISO 8601 date format}. */
    export type Date = string;

    /** A combination of date and time of day in the form [-]CCYY-MM-DDThh:mm:ss[Z|(+|-)hh:mm] (see Chapter 5.4 of ISO 8601). */
    export type DateTime = string;

    /** Data type: Number. */
    export type Number = number;

    /** Data type: Text. */
    export type Text = string;

    /** DateTime represented in string, e.g. 2017-01-04T17:10:00-05:00. */
    export type Time = string;

    /** The basic data types such as Integers, Strings, etc. */
    export type DataType = Text | Number | Time | Date | DateTime | Boolean;

    type EntryPointBase = ThingBase;
    type EntryPointLeaf = {
        \\"@type\\": \\"EntryPoint\\";
    } & EntryPointBase;
    export type EntryPoint = EntryPointLeaf | string;

    type OrganizationBase = ThingBase & {
        \\"locatedIn\\"?: Place | readonly Place[];
        \\"owner\\"?: Person | readonly Person[];
        \\"urlTemplate\\"?: URL | readonly URL[];
    };
    type OrganizationLeaf = {
        \\"@type\\": \\"Organization\\";
    } & OrganizationBase;
    export type Organization = OrganizationLeaf | string;

    type PersonBase = ThingBase & {
        \\"height\\"?: Quantity | readonly Quantity[];
        \\"locatedIn\\"?: Place | readonly Place[];
    };
    type PersonLeaf = {
        \\"@type\\": \\"Person\\";
    } & PersonBase;
    export type Person = PersonLeaf | string;

    type PlaceBase = ThingBase;
    type PlaceLeaf = {
        \\"@type\\": \\"Place\\";
    } & PlaceBase;
    export type Place = PlaceLeaf | string;

    type QuantityBase = ThingBase;
    type QuantityLeaf = {
        \\"@type\\": \\"Quantity\\";
    } & QuantityBase;
    export type Quantity = QuantityLeaf | string;

    type ThingBase = {
        /** IRI identifying the canonical address of this object. */
        \\"@id\\"?: string;
        \\"name\\"?: Text | readonly Text[];
    };
    type ThingLeaf = {
        \\"@type\\": \\"Thing\\";
    } & ThingBase;
    export type Thing = ThingLeaf | EntryPoint | Organization | Person | Place | Quantity;

    "
  `);
});
