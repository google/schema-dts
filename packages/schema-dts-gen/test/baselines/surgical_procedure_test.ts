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

    interface DiagnosticProcedureLeaf extends ThingBase {
        "@type": "DiagnosticProcedure";
    }
    export type DiagnosticProcedure = DiagnosticProcedureLeaf;

    interface EnumerationLeaf extends ThingBase {
        "@type": "Enumeration";
    }
    export type Enumeration = EnumerationLeaf | MedicalEnumeration;

    interface IntangibleLeaf extends ThingBase {
        "@type": "Intangible";
    }
    export type Intangible = IntangibleLeaf | Enumeration;

    interface MedicalEntityLeaf extends ThingBase {
        "@type": "MedicalEntity";
    }
    export type MedicalEntity = MedicalEntityLeaf | MedicalProcedure;

    interface MedicalEnumerationLeaf extends ThingBase {
        "@type": "MedicalEnumeration";
    }
    export type MedicalEnumeration = MedicalEnumerationLeaf | MedicalProcedureType | PhysicalExam;

    interface MedicalProcedureLeaf extends ThingBase {
        "@type": "MedicalProcedure";
    }
    /** A process of care used in either a diagnostic, therapeutic, preventive or palliative capacity that relies on invasive (surgical), non-invasive, or other techniques. */
    export type MedicalProcedure = MedicalProcedureLeaf | DiagnosticProcedure | PalliativeProcedure | PhysicalExam | SurgicalProcedure | TherapeuticProcedure;

    interface MedicalProcedureTypeLeaf extends ThingBase {
        "@type": "MedicalProcedureType";
    }
    /** An enumeration that describes different types of medical procedures. */
    export type MedicalProcedureType = "http://schema.org/NoninvasiveProcedure" | "https://schema.org/NoninvasiveProcedure" | "NoninvasiveProcedure" | "http://schema.org/PercutaneousProcedure" | "https://schema.org/PercutaneousProcedure" | "PercutaneousProcedure" | MedicalProcedureTypeLeaf;

    interface MedicalTherapyLeaf extends ThingBase {
        "@type": "MedicalTherapy";
    }
    export type MedicalTherapy = MedicalTherapyLeaf | PalliativeProcedure;

    interface PalliativeProcedureBase extends ThingBase, ThingBase {
    }
    interface PalliativeProcedureLeaf extends PalliativeProcedureBase {
        "@type": "PalliativeProcedure";
    }
    export type PalliativeProcedure = PalliativeProcedureLeaf;

    interface PhysicalExamBase extends ThingBase, ThingBase {
    }
    interface PhysicalExamLeaf extends PhysicalExamBase {
        "@type": "PhysicalExam";
    }
    export type PhysicalExam = "http://schema.org/Head" | "https://schema.org/Head" | "Head" | "http://schema.org/Neuro" | "https://schema.org/Neuro" | "Neuro" | PhysicalExamLeaf;

    interface SurgicalProcedureLeaf extends ThingBase {
        "@type": "SurgicalProcedure";
    }
    /** A medical procedure involving an incision with instruments; performed for diagnose, or therapeutic purposes. */
    export type SurgicalProcedure = SurgicalProcedureLeaf;

    interface TherapeuticProcedureLeaf extends ThingBase {
        "@type": "TherapeuticProcedure";
    }
    export type TherapeuticProcedure = TherapeuticProcedureLeaf | MedicalTherapy;

    interface ThingBase extends Partial<IdReference> {
        "procedureType"?: SchemaValue<MedicalProcedureType | IdReference>;
    }
    interface ThingLeaf extends ThingBase {
        "@type": "Thing";
    }
    export type Thing = ThingLeaf | Intangible | MedicalEntity;

    "
  `);
});
