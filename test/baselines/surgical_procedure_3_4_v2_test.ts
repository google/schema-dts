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
<http://schema.org/SurgicalProcedure> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/SurgicalProcedure> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/MedicalProcedureType> .
<http://schema.org/SurgicalProcedure> <http://schema.org/isPartOf> <http://health-lifesci.schema.org> .
<http://schema.org/SurgicalProcedure> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/MedicalProcedure> .
<http://schema.org/SurgicalProcedure> <http://www.w3.org/2000/01/rdf-schema#comment> "A type of medical procedure that involves invasive surgical techniques." .
<http://schema.org/SurgicalProcedure> <http://www.w3.org/2002/07/owl#equivalentClass> <http://purl.bioontology.org/ontology/SNOMEDCT/387713003> .
<http://schema.org/SurgicalProcedure> <http://www.w3.org/2002/07/owl#equivalentClass> <http://purl.bioontology.org/ontology/SNOMEDCT/387713003> .
<http://schema.org/MedicalProcedureType> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/MedicalProcedureType> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/MedicalEnumeration> .
<http://schema.org/MedicalProcedureType> <http://schema.org/isPartOf> <http://health-lifesci.schema.org> .
<http://schema.org/MedicalProcedure> <http://schema.org/isPartOf> <http://health-lifesci.schema.org> .
<http://schema.org/MedicalProcedure> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/MedicalProcedure> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/MedicalEnumeration> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/MedicalEnumeration> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Enumeration> .
<http://schema.org/Enumeration> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Enumeration> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Intangible> .
<http://schema.org/Intangible> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Intangible> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
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

    type EnumerationLeaf = {
        \\"@type\\": \\"Enumeration\\";
    } & ThingBase;
    export type Enumeration = EnumerationLeaf | MedicalEnumeration;

    type IntangibleLeaf = {
        \\"@type\\": \\"Intangible\\";
    } & ThingBase;
    export type Intangible = IntangibleLeaf | Enumeration;

    type MedicalEnumerationLeaf = {
        \\"@type\\": \\"MedicalEnumeration\\";
    } & ThingBase;
    export type MedicalEnumeration = MedicalEnumerationLeaf | MedicalProcedureType;

    type MedicalProcedureLeaf = {
        \\"@type\\": \\"MedicalProcedure\\";
    } & ThingBase;
    export type MedicalProcedure = MedicalProcedureLeaf | SurgicalProcedure;

    type MedicalProcedureTypeLeaf = {
        \\"@type\\": \\"MedicalProcedureType\\";
    } & ThingBase;
    export type MedicalProcedureType = \\"http://schema.org/SurgicalProcedure\\" | \\"https://schema.org/SurgicalProcedure\\" | \\"SurgicalProcedure\\" | MedicalProcedureTypeLeaf;
    export const MedicalProcedureType = {
        /**
         * A type of medical procedure that involves invasive surgical techniques.
         * @deprecated Please use the literal string \\"SurgicalProcedure\\" instead.
         */
        SurgicalProcedure: (\\"http://schema.org/SurgicalProcedure\\" as const)
    };

    type SurgicalProcedureLeaf = {
        \\"@type\\": \\"SurgicalProcedure\\";
    } & ThingBase;
    /** A type of medical procedure that involves invasive surgical techniques. */
    export type SurgicalProcedure = SurgicalProcedureLeaf;

    type ThingBase = Partial<IdReference>;
    type ThingLeaf = {
        \\"@type\\": \\"Thing\\";
    } & ThingBase;
    export type Thing = ThingLeaf | Intangible | MedicalProcedure;

    "
  `);
});
