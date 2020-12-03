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
<http://schema.org/name> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/name> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/name> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/name2> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/name2> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/name2> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/name3> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/name3> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/name3> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/name> <http://www.w3.org/2000/01/rdf-schema#comment> "Names are great!\\n <a href=\\"X\\">Y</a>" .
<http://schema.org/name2> <http://www.w3.org/2000/01/rdf-schema#comment> "Names are great!\\n [Y](X)" .
<http://schema.org/name3> <http://www.w3.org/2000/01/rdf-schema#comment> "[[Link]]s [[URL|Aliased]]" .
<http://schema.org/Thing> <http://www.w3.org/2000/01/rdf-schema#comment> "Things are amazing!\\n\\n<br/><br /><ul><li>Foo</li><li>Bar</li><li><em>Baz</em>, and <strong>Bat</strong></li><ul>" .
<http://schema.org/knows> <http://www.w3.org/2000/01/rdf-schema#comment> "Reminds me of this quote:\\n\\n<br /><code>Foo\\nBar</code>\\n\\n<br/><br/><pre>Hey!</pre> this." .
<http://schema.org/knows> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/knows> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/knows> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/DataType> .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Text> <http://www.w3.org/2000/01/rdf-schema#comment> "Data type: Text." .
<http://schema.org/Number> <http://www.w3.org/2000/01/rdf-schema#comment> "Data type: Number.\\n\\nUsage guidelines:\\n\\n* Use values from 0123456789 (Unicode 'DIGIT ZERO' (U+0030) to 'DIGIT NINE' (U+0039)) rather than superficially similiar Unicode symbols.\\n* Use '.' (Unicode 'FULL STOP' (U+002E)) rather than ',' to indicate a decimal point. Avoid using these symbols as a readability separator." .
<http://schema.org/Number> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Number> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/DataType> .
<http://schema.org/encodingFormat> <http://www.w3.org/2000/01/rdf-schema#comment> "Media type typically expressed using a MIME format (see [IANA site](http://www.iana.org/assignments/media-types/media-types.xhtml) and [MDN reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)) e.g. application/zip for a SoftwareApplication binary, audio/mpeg for .mp3 etc.).\n\nIn cases where a [[CreativeWork]] has several media type representations, [[encoding]] can be used to indicate each [[MediaObject]] alongside particular [[encodingFormat]] information.\n\nUnregistered or niche encoding and file formats can be indicated instead via the most appropriate URL, e.g. defining Web page or a Wikipedia/Wikidata entry." .
<http://schema.org/encodingFormat> <https://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/encodingFormat> <https://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/encodingFormat> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
      `,
    ['--ontology', `https://fake.com/${basename(__filename)}.nt`]
  );

  expect(actual).toMatchInlineSnapshot(`
    "/** Used at the top-level node to indicate the context for the JSON-LD objects used. The context provided in this type is compatible with the keys and URLs in the rest of this generated file. */
    export type WithContext<T extends Thing> = Graph | (T & {
        \\"@context\\": \\"https://schema.org\\";
    });
    export interface Graph {
        \\"@context\\": \\"https://schema.org\\";
        \\"@graph\\": readonly Thing[];
    }
    type SchemaValue<T> = T | readonly T[];
    type IdReference = {
        /** IRI identifying the canonical address of this object. */
        \\"@id\\": string;
    };

    /**
     * Data type: Number.
     *
     * Usage guidelines:
     * - Use values from 0123456789 (Unicode 'DIGIT ZERO' (U+0030) to 'DIGIT NINE' (U+0039)) rather than superficially similiar Unicode symbols.
     * - Use '.' (Unicode 'FULL STOP' (U+002E)) rather than ',' to indicate a decimal point. Avoid using these symbols as a readability separator.
     */
    export type Number = number;

    /** Data type: Text. */
    export type Text = string;

    interface ThingBase extends Partial<IdReference> {
        /**
         * Media type typically expressed using a MIME format (see {@link http://www.iana.org/assignments/media-types/media-types.xhtml IANA site} and {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types MDN reference}) e.g. application/zip for a SoftwareApplication binary, audio/mpeg for .mp3 etc.).
         *
         * In cases where a {@link CreativeWork} has several media type representations, {@link encoding} can be used to indicate each {@link MediaObject} alongside particular {@link encodingFormat} information.
         *
         * Unregistered or niche encoding and file formats can be indicated instead via the most appropriate URL, e.g. defining Web page or a Wikipedia/Wikidata entry.
         */
        \\"encodingFormat\\"?: SchemaValue<Text>;
        /**
         * Reminds me of this quote:
         * \`Foo Bar\`
         *
         * \`Hey!\` this.
         */
        \\"knows\\"?: SchemaValue<Text>;
        /** Names are great! {@link X Y} */
        \\"name\\"?: SchemaValue<Text>;
        /** Names are great! {@link X Y} */
        \\"name2\\"?: SchemaValue<Text>;
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
    export type Thing = ThingLeaf;

    "
  `);
});
