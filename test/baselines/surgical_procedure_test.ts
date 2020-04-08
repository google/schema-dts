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
      ['--ontology', `https://fake.com/${basename(__filename)}.nt`]);

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

    type DiagnosticProcedureBase = MedicalProcedureBase;
    export type DiagnosticProcedure = {
        \\"@type\\": \\"DiagnosticProcedure\\";
    } & DiagnosticProcedureBase;

    type EnumerationBase = IntangibleBase;
    export type Enumeration = ({
        \\"@type\\": \\"Enumeration\\";
    } & EnumerationBase) | MedicalEnumeration;

    type IntangibleBase = ThingBase;
    export type Intangible = ({
        \\"@type\\": \\"Intangible\\";
    } & IntangibleBase) | Enumeration;

    type MedicalEntityBase = ThingBase;
    export type MedicalEntity = ({
        \\"@type\\": \\"MedicalEntity\\";
    } & MedicalEntityBase) | MedicalProcedure;

    type MedicalEnumerationBase = EnumerationBase;
    export type MedicalEnumeration = ({
        \\"@type\\": \\"MedicalEnumeration\\";
    } & MedicalEnumerationBase) | (MedicalProcedureType | PhysicalExam);

    type MedicalProcedureBase = MedicalEntityBase;
    /** A process of care used in either a diagnostic, therapeutic, preventive or palliative capacity that relies on invasive (surgical), non-invasive, or other techniques. */
    export type MedicalProcedure = ({
        \\"@type\\": \\"MedicalProcedure\\";
    } & MedicalProcedureBase) | (DiagnosticProcedure | PalliativeProcedure | PhysicalExam | SurgicalProcedure | TherapeuticProcedure);

    type MedicalProcedureTypeBase = MedicalEnumerationBase;
    /** An enumeration that describes different types of medical procedures. */
    export type MedicalProcedureType = \\"http://schema.org/NoninvasiveProcedure\\" | \\"http://schema.org/PercutaneousProcedure\\" | ({
        \\"@type\\": \\"MedicalProcedureType\\";
    } & MedicalProcedureTypeBase);
    export const MedicalProcedureType = {
        NoninvasiveProcedure: (\\"http://schema.org/NoninvasiveProcedure\\" as const),
        PercutaneousProcedure: (\\"http://schema.org/PercutaneousProcedure\\" as const)
    };

    type MedicalTherapyBase = TherapeuticProcedureBase;
    export type MedicalTherapy = ({
        \\"@type\\": \\"MedicalTherapy\\";
    } & MedicalTherapyBase) | PalliativeProcedure;

    type PalliativeProcedureBase = (MedicalProcedureBase & MedicalTherapyBase);
    export type PalliativeProcedure = {
        \\"@type\\": \\"PalliativeProcedure\\";
    } & PalliativeProcedureBase;

    type PhysicalExamBase = (MedicalProcedureBase & MedicalEnumerationBase);
    export type PhysicalExam = \\"http://schema.org/Head\\" | \\"http://schema.org/Neuro\\" | ({
        \\"@type\\": \\"PhysicalExam\\";
    } & PhysicalExamBase);
    export const PhysicalExam = {
        Head: (\\"http://schema.org/Head\\" as const),
        Neuro: (\\"http://schema.org/Neuro\\" as const)
    };

    type SurgicalProcedureBase = MedicalProcedureBase;
    /** A medical procedure involving an incision with instruments; performed for diagnose, or therapeutic purposes. */
    export type SurgicalProcedure = {
        \\"@type\\": \\"SurgicalProcedure\\";
    } & SurgicalProcedureBase;

    type TherapeuticProcedureBase = MedicalProcedureBase;
    export type TherapeuticProcedure = ({
        \\"@type\\": \\"TherapeuticProcedure\\";
    } & TherapeuticProcedureBase) | MedicalTherapy;

    type ThingBase = {
        /** IRI identifying the canonical address of this object. */
        \\"@id\\"?: string;
        \\"procedureType\\"?: MedicalProcedureType | readonly MedicalProcedureType[];
    };
    export type Thing = ({
        \\"@type\\": \\"Thing\\";
    } & ThingBase) | (Intangible | MedicalEntity);

    "
  `);
});
