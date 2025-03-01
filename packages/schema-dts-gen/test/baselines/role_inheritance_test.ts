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
<https://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://schema.org/DataType> .
<https://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/Role> <http://www.w3.org/2000/01/rdf-schema#comment> "Represents additional information about a relationship or property. For example a Role can be used to say that a 'member' role linking some SportsTeam to a player occurred during a particular time period. Or that a Person's 'actor' role in a Movie was for some particular characterName. Such properties can be attached to a Role entity, which is then associated with the main entities using ordinary properties like 'member' or 'actor'.\\n\\nSee also [blog post](http://blog.schema.org/2014/06/introducing-role.html)." .
<https://schema.org/Role> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <https://schema.org/Intangible> .
<https://schema.org/Role> <http://www.w3.org/2000/01/rdf-schema#label> "Role" .
<https://schema.org/Role> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/Intangible> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/Intangible> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <https://schema.org/Thing> .
<https://schema.org/startDate> <https://schema.org/domainIncludes> <https://schema.org/Role> .
<https://schema.org/startDate> <https://schema.org/rangeIncludes> <https://schema.org/DateTime> .
<https://schema.org/startDate> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<https://schema.org/DateTime> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/DateTime> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<https://schema.org/OrganizationRole> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <https://schema.org/Role> .
<https://schema.org/OrganizationRole> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .

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
    type SchemaValue<T, TProperty extends string> = T | Role<T, TProperty> | readonly (T | Role<T, TProperty>)[];
    type IdReference = {
        /** IRI identifying the canonical address of this object. */
        "@id": string;
    };

    interface DateTimeBase extends Partial<IdReference> {
    }
    interface DateTimeLeaf extends DateTimeBase {
        "@type": "DateTime";
    }
    export type DateTime = DateTimeLeaf | string;

    type OrganizationRoleLeaf<TContent, TProperty extends string> = RoleBase & {
        "@type": "OrganizationRole";
    } & {
        [key in TProperty]: TContent;
    };
    export type OrganizationRole<TContent = never, TProperty extends string = never> = OrganizationRoleLeaf<TContent, TProperty>;

    interface RoleBase extends ThingBase {
        "startDate"?: SchemaValue<DateTime | IdReference, "startDate">;
    }
    type RoleLeaf<TContent, TProperty extends string> = RoleBase & {
        "@type": "Role";
    } & {
        [key in TProperty]: TContent;
    };
    /**
     * Represents additional information about a relationship or property. For example a Role can be used to say that a 'member' role linking some SportsTeam to a player occurred during a particular time period. Or that a Person's 'actor' role in a Movie was for some particular characterName. Such properties can be attached to a Role entity, which is then associated with the main entities using ordinary properties like 'member' or 'actor'.
     *
     * See also {@link http://blog.schema.org/2014/06/introducing-role.html blog post}.
     */
    export type Role<TContent = never, TProperty extends string = never> = RoleLeaf<TContent, TProperty> | OrganizationRole<TContent, TProperty>;

    export type Text = string;

    interface IntangibleLeaf extends ThingBase {
        "@type": "Intangible";
    }
    export type Intangible = IntangibleLeaf | Role;

    interface ThingBase extends Partial<IdReference> {
        "name"?: SchemaValue<Text, "name">;
    }
    interface ThingLeaf extends ThingBase {
        "@type": "Thing";
    }
    export type Thing = ThingLeaf | Intangible;

    "
  `);
});
