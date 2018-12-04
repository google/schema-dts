/**
 * Copyright 2018 Google LLC
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
 */
import {createEnumMember, createStringLiteral} from 'typescript';

import {withComments} from './comments';
import {toEnumName} from './names';
import {ClassMap} from './toClass';
import {ObjectPredicate, toString, TSubject, TypedTopic} from './triple';
import {GetComment, GetType, HasEnumType, IsClassType, IsDataType} from './wellKnown';


export class EnumValue {
  readonly INSTANCE = 'EnumValue';

  private comment?: string;
  constructor(private readonly value: TSubject) {}

  add(value: ObjectPredicate, map: ClassMap) {
    // First, "Type" containment.
    // A Topic can have multiple types. So the triple we're adding now could
    // either be:
    // 1. An already processed well-known type (e.g. the Topic is also a Class,
    //    as well as being an enum).
    // 2. The Type of the Enum.
    //
    // e.g.: SurgicalProcedure (schema.org/SurgicalProcedure) is both a class
    //       having the "Class" type, and also an instance of the
    //       MedicalProcedureType (schema.org/MedicalProcedureType) enum.
    //       Therefore, an Enum will contain two TTypeName ObjectPredicates:
    //       one of Type=Class, and another of Type=MedicalProcedureType.
    const type = GetType(value);
    if (type) {
      if (IsClassType(type) || IsDataType(type)) return true;

      const enumObject = map.get(type.toString());
      if (!enumObject) {
        throw new Error(`Couldn't find ${type.toString()} in classes.`);
      }
      enumObject.addEnum(this);
      return true;
    }

    // Comment.
    const comment = GetComment(value);
    if (comment) {
      if (this.comment) {
        throw new Error(`Attempt to add comment on ${
            this.value.toString()} enum but one already exists.`);
      }
      this.comment = comment.comment;
      return true;
    }

    return false;
  }

  toNode() {
    return withComments(
        this.comment,
        createEnumMember(
            toEnumName(this.value),
            createStringLiteral(this.value.toString())));
  }
}

export function ProcessEnums(
    topics: ReadonlyArray<TypedTopic>, classes: ClassMap) {
  // Process Enums
  for (const topic of topics) {
    if (!HasEnumType(topic.types)) continue;

    // Everything Here should be an enum.
    const enumValue = new EnumValue(topic.Subject);
    const skipped: ObjectPredicate[] = [];
    for (const v of topic.values) {
      if (!enumValue.add(v, classes)) skipped.push(v);
    }

    if (skipped.length > 0) {
      console.error(
          `For Enum Item ${topic.Subject.name}, did not process: `,
          skipped.map(toString));
    }
  }
}
