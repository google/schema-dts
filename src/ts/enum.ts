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

import {ObjectPredicate, TSubject, TTypeName} from '../triples/triple';
import {GetComment, IsClassType, IsDataType} from '../triples/wellKnown';

import {ClassMap} from './class';
import {withComments} from './util/comments';
import {toEnumName} from './util/names';

/**
 * Corresponds to a value that belongs to an Enumeration.
 */
export class EnumValue {
  readonly INSTANCE = 'EnumValue';

  private comment?: string;
  constructor(
      readonly value: TSubject, types: ReadonlyArray<TTypeName>,
      map: ClassMap) {
    for (const type of types) {
      // "Type" containment.
      // A Topic can have multiple types. So the triple we're adding now could
      // either be:
      // 1. An already processed well-known type (e.g. the Topic is also a
      // Class,
      //    as well as being an enum).
      // 2. The Type of the Enum.
      //
      // e.g.: SurgicalProcedure (schema.org/SurgicalProcedure) is both a class
      //       having the "Class" type, and also an instance of the
      //       MedicalProcedureType (schema.org/MedicalProcedureType) enum.
      //       Therefore, an Enum will contain two TTypeName ObjectPredicates:
      //       one of Type=Class, and another of Type=MedicalProcedureType.
      if (IsClassType(type) || IsDataType(type)) return;

      const enumObject = map.get(type.toString());
      if (!enumObject) {
        throw new Error(`Couldn't find ${type.toString()} in classes.`);
      }
      enumObject.addEnum(this);
    }
  }

  add(value: ObjectPredicate) {
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
