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
  const {actual, actualLogs} = await inlineCli(
    `
<http://schema.org/b> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/a> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/c> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/d> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/c> <http://www.w3.org/2000/01/rdf-schema#comment> "A letter!" .
<http://schema.org/c> <http://schema.org/category> "issue-1156" .
<http://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Thing> <http://www.w3.org/2000/01/rdf-schema#comment> "A Thing!" .
`,
    ['--ontology', `https://fake.com/${basename(__filename)}.nt`, `--verbose`]
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

    type ThingBase = {
        /** IRI identifying the canonical address of this object. */
        \\"@id\\"?: string;
    };
    type ThingLeaf = {
        \\"@type\\": \\"Thing\\";
    } & ThingBase;
    /** A Thing! */
    export type Thing = \\"http://schema.org/a\\" | \\"http://schema.org/b\\" | \\"http://schema.org/c\\" | \\"http://schema.org/d\\" | (ThingLeaf);
    export const Thing = {
        a: (\\"http://schema.org/a\\" as const),
        b: (\\"http://schema.org/b\\" as const),
        /** A letter! */
        c: (\\"http://schema.org/c\\" as const),
        d: (\\"http://schema.org/d\\" as const)
    };

    "
  `);
  expect(actualLogs).toMatchInlineSnapshot(`
    "Loading Ontology from URL: https://fake.com/enum_skipped_test.ts.nt
    Got Response 200: Ok.
    For Enum Item c, did not process:
    	(category, \\"issue-1156\\")
    "
  `);
});
