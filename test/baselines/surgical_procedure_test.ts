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
<http://schema.org/SurgicalProcedure> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/MedicalProcedure> .
<http://schema.org/SurgicalProcedure> <http://www.w3.org/2000/01/rdf-schema#comment> "A medical procedure involving an incision with instruments; performed for diagnose, or therapeutic purposes." .
<http://schema.org/SurgicalProcedure> <http://www.w3.org/2000/01/rdf-schema#label> "SurgicalProcedure" .
<http://schema.org/SurgicalProcedure> <http://www.w3.org/2002/07/owl#equivalentClass> <http://purl.bioontology.org/ontology/SNOMEDCT/387713003> .
<http://schema.org/SurgicalProcedure> <http://schema.org/isPartOf> <http://health-lifesci.schema.org> .
<http://schema.org/SurgicalProcedure> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/PercutaneousProcedure> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/MedicalProcedureType> .
<http://schema.org/NoninvasiveProcedure> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/MedicalProcedureType> .
<http://schema.org/MedicalProcedureType> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/MedicalProcedure> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/MedicalProcedure> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/MedicalEntity> .
<http://schema.org/MedicalProcedureType> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/MedicalEnumeration> .
<http://schema.org/MedicalProcedure> <http://schema.org/isPartOf> <http://health-lifesci.schema.org> .
<http://schema.org/MedicalProcedure> <http://www.w3.org/2000/01/rdf-schema#label> "MedicalProcedure" .
<http://schema.org/PhysicalExam> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/MedicalProcedure> .
<http://schema.org/PalliativeProcedure> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/MedicalProcedure> .
<http://schema.org/MedicalProcedureType> <http://www.w3.org/2000/01/rdf-schema#comment> "An enumeration that describes different types of medical procedures." .
<http://schema.org/TherapeuticProcedure> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/MedicalProcedure> .
<http://schema.org/DiagnosticProcedure> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/MedicalProcedure> .
<http://schema.org/TherapeuticProcedure> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/DiagnosticProcedure> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/MedicalProcedure> <http://www.w3.org/2002/07/owl#equivalentClass> <http://purl.bioontology.org/ontology/SNOMEDCT/50731006> .
<http://schema.org/MedicalProcedure> <http://www.w3.org/2000/01/rdf-schema#comment> "A process of care used in either a diagnostic, therapeutic, preventive or palliative capacity that relies on invasive (surgical), non-invasive, or other techniques." .
<http://schema.org/MedicalProcedureType> <http://schema.org/isPartOf> <http://health-lifesci.schema.org> .
<http://schema.org/MedicalProcedureType> <http://www.w3.org/2000/01/rdf-schema#label> "MedicalProcedureType" .
<http://schema.org/procedureType> <http://schema.org/rangeIncludes> <http://schema.org/MedicalProcedureType> .
<http://schema.org/procedureType> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Head> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/PhysicalExam> .
<http://schema.org/Neuro> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/PhysicalExam> .
<http://schema.org/PhysicalExam> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/MedicalEnumeration> .
<http://schema.org/MedicalEnumeration> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/MedicalEnumeration> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Enumeration> .
<http://schema.org/Enumeration> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Intangible> .
<http://schema.org/Enumeration> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Intangible> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Intangible> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/PhysicalExam> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/PalliativeProcedure> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/MedicalTherapy> .
<http://schema.org/PalliativeProcedure> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/MedicalTherapy> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/MedicalTherapy> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/TherapeuticProcedure> .
<http://schema.org/MedicalEntity> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/MedicalEntity> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/procedureType> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
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

    type DiagnosticProcedureLeaf = {
        \\"@type\\": \\"DiagnosticProcedure\\";
    } & ThingBase;
    export type DiagnosticProcedure = DiagnosticProcedureLeaf;

    type EnumerationLeaf = {
        \\"@type\\": \\"Enumeration\\";
    } & ThingBase;
    export type Enumeration = EnumerationLeaf | MedicalEnumeration;

    type IntangibleLeaf = {
        \\"@type\\": \\"Intangible\\";
    } & ThingBase;
    export type Intangible = IntangibleLeaf | Enumeration;

    type MedicalEntityLeaf = {
        \\"@type\\": \\"MedicalEntity\\";
    } & ThingBase;
    export type MedicalEntity = MedicalEntityLeaf | MedicalProcedure;

    type MedicalEnumerationLeaf = {
        \\"@type\\": \\"MedicalEnumeration\\";
    } & ThingBase;
    export type MedicalEnumeration = MedicalEnumerationLeaf | MedicalProcedureType | PhysicalExam;

    type MedicalProcedureLeaf = {
        \\"@type\\": \\"MedicalProcedure\\";
    } & ThingBase;
    /** A process of care used in either a diagnostic, therapeutic, preventive or palliative capacity that relies on invasive (surgical), non-invasive, or other techniques. */
    export type MedicalProcedure = MedicalProcedureLeaf | DiagnosticProcedure | PalliativeProcedure | PhysicalExam | SurgicalProcedure | TherapeuticProcedure;

    type MedicalProcedureTypeLeaf = {
        \\"@type\\": \\"MedicalProcedureType\\";
    } & ThingBase;
    /** An enumeration that describes different types of medical procedures. */
    export type MedicalProcedureType = \\"http://schema.org/NoninvasiveProcedure\\" | \\"http://schema.org/PercutaneousProcedure\\" | MedicalProcedureTypeLeaf;
    export const MedicalProcedureType = {
        NoninvasiveProcedure: (\\"http://schema.org/NoninvasiveProcedure\\" as const),
        PercutaneousProcedure: (\\"http://schema.org/PercutaneousProcedure\\" as const)
    };

    type MedicalTherapyLeaf = {
        \\"@type\\": \\"MedicalTherapy\\";
    } & ThingBase;
    export type MedicalTherapy = MedicalTherapyLeaf | PalliativeProcedure;

    type PalliativeProcedureBase = (ThingBase & ThingBase);
    type PalliativeProcedureLeaf = {
        \\"@type\\": \\"PalliativeProcedure\\";
    } & PalliativeProcedureBase;
    export type PalliativeProcedure = PalliativeProcedureLeaf;

    type PhysicalExamBase = (ThingBase & ThingBase);
    type PhysicalExamLeaf = {
        \\"@type\\": \\"PhysicalExam\\";
    } & PhysicalExamBase;
    export type PhysicalExam = \\"http://schema.org/Head\\" | \\"http://schema.org/Neuro\\" | PhysicalExamLeaf;
    export const PhysicalExam = {
        Head: (\\"http://schema.org/Head\\" as const),
        Neuro: (\\"http://schema.org/Neuro\\" as const)
    };

    type SurgicalProcedureLeaf = {
        \\"@type\\": \\"SurgicalProcedure\\";
    } & ThingBase;
    /** A medical procedure involving an incision with instruments; performed for diagnose, or therapeutic purposes. */
    export type SurgicalProcedure = SurgicalProcedureLeaf;

    type TherapeuticProcedureLeaf = {
        \\"@type\\": \\"TherapeuticProcedure\\";
    } & ThingBase;
    export type TherapeuticProcedure = TherapeuticProcedureLeaf | MedicalTherapy;

    type ThingBase = Partial<IdReference> & {
        \\"procedureType\\"?: SchemaValue<MedicalProcedureType | IdReference>;
    };
    type ThingLeaf = {
        \\"@type\\": \\"Thing\\";
    } & ThingBase;
    export type Thing = ThingLeaf | Intangible | MedicalEntity;

    "
  `);
});
