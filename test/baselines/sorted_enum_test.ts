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
<http://schema.org/b> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/a> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/c> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/d> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Thing> .
<http://schema.org/c> <http://www.w3.org/2000/01/rdf-schema#comment> "A letter!" .
<http://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Thing> <http://www.w3.org/2000/01/rdf-schema#comment> "A Thing!" .
      `,
    ['--ontology', `https://fake.com/${basename(__filename)}.nt`]
  );

  expect(actual).toMatchInlineSnapshot(`
    "/** Used at the top-level node to indicate the context for the JSON-LD objects used. The context provided in this type is compatible with the keys and URLs in the rest of this generated file. */
    export type WithContext<T extends Thing> = T & {
        \\"@context\\": \\"https://schema.org\\";
    };

    type SchemaValue<T> = T | readonly T[];
    type IdReference = {
        /** IRI identifying the canonical address of this object. */
        \\"@id\\": string;
    };

    type ThingBase = Partial<IdReference>;
    type ThingLeaf = {
        \\"@type\\": \\"Thing\\";
    } & ThingBase;
    /** A Thing! */
    export type Thing = \\"http://schema.org/a\\" | \\"https://schema.org/a\\" | \\"a\\" | \\"http://schema.org/b\\" | \\"https://schema.org/b\\" | \\"b\\" | \\"http://schema.org/c\\" | \\"https://schema.org/c\\" | \\"c\\" | \\"http://schema.org/d\\" | \\"https://schema.org/d\\" | \\"d\\" | ThingLeaf;
    export const Thing = {
        /**
         * undefined
         * @deprecated Please use the literal string \\"a\\" instead.
         */
        a: (\\"http://schema.org/a\\" as const),
        /**
         * undefined
         * @deprecated Please use the literal string \\"b\\" instead.
         */
        b: (\\"http://schema.org/b\\" as const),
        /**
         * A letter!
         * @deprecated Please use the literal string \\"c\\" instead.
         */
        c: (\\"http://schema.org/c\\" as const),
        /**
         * undefined
         * @deprecated Please use the literal string \\"d\\" instead.
         */
        d: (\\"http://schema.org/d\\" as const)
    };

    "
  `);
});
