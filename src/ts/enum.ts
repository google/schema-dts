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
 */
import {factory, TypeNode} from 'typescript';

import {Log} from '../logging';
import {ObjectPredicate, TSubject, TTypeName} from '../triples/triple';
import {GetComment, IsClassType, IsDataType} from '../triples/wellKnown';

import {ClassMap} from './class';
import {withComments} from './util/comments';
import {toEnumName} from './util/names';
import {Context} from './context';

/**
 * Corresponds to a value that belongs to an Enumeration.
 */
export class EnumValue {
  readonly INSTANCE = 'EnumValue';

  private comment?: string;
  constructor(
    readonly value: TSubject,
    types: readonly TTypeName[],
    map: ClassMap
  ) {
    for (const type of types) {
      // If a Subject has a "Type", then it either means:
      // 1- Type is Class - This topic represents an object that can be
      //    represented as a class (usually, a node/object).
      // 2- Type is DataType - This topic represents an object that can
      //    represented as a raw value.
      // 3- Type is Neither - This topic's IRI can be used in the place of that
      //    type to describe its value.
      //
      // For example,
      // - Thing is a Class only.
      // - Text is a Class and a DataType.
      // - DataType is a Class.
      // - Wednesday is a DayOfWeek only.
      //
      // In Schema.org 3.4, some enumerations were both a Class and an Enum.
      //
      // For example, SurgicalProcedure was both an enum value for
      // MedicalProcedureType and a class that can be described in its own
      // right. It had type Class and MedicalProcedureType.
      //
      // For those cases, we make sure:
      // (a) We add an EnumValue for all types that are not Class/DataType.
      // (b) An EnumValue being a Class/DataType should not disqualify it from
      //     being an enum value for some other type (if it has one).
      if (IsClassType(type) || IsDataType(type)) continue;

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
        Log(
          `Duplicate comments provided on ${this.value.toString()} enum but one already exists. It will be overwritten.`
        );
      }
      this.comment = comment.comment;
      return true;
    }

    return false;
  }

  /** @deprecated Generating Property Assignment nodes for Enums will go away in 0.8.0. */
  toNode() {
    return withComments(
      this.comment +
        `\n@deprecated Please use the literal string "${toEnumName(
          this.value
        )}" instead.`,
      factory.createPropertyAssignment(
        toEnumName(this.value),
        factory.createAsExpression(
          factory.createStringLiteral(this.value.toString()),
          factory.createTypeReferenceNode('const', undefined)
        )
      )
    );
  }

  toTypeLiteral(context: Context): TypeNode[] {
    const types = [
      factory.createLiteralTypeNode(
        factory.createStringLiteral(this.value.toString())
      ),
    ];
    if (this.value.context.protocol === 'http:') {
      types.push(
        factory.createLiteralTypeNode(
          factory.createStringLiteral(
            this.value.toString().replace(/^http:/, 'https:')
          )
        )
      );
    }

    const scoped = context.getScopedName(this.value);
    if (scoped !== this.value.href) {
      types.push(
        factory.createLiteralTypeNode(factory.createStringLiteral(scoped))
      );
    }

    return types;
  }
}
