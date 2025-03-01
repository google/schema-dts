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
 */
import ts from 'typescript';
import type {TypeNode} from 'typescript';
const {factory} = ts;

import {Log} from '../logging/index.js';

import {GetComment, IsClassType, IsDataType} from '../triples/wellKnown.js';

import {ClassMap} from './class.js';
import {Context} from './context.js';

import type {NamedNode, Quad} from 'n3';

/**
 * Corresponds to a value that belongs to an Enumeration.
 */
export class EnumValue {
  readonly INSTANCE = 'EnumValue';

  private comment?: string;
  constructor(
    readonly value: NamedNode,
    types: readonly NamedNode[],
    map: ClassMap,
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

      const enumObject = map.get(type.id);
      if (!enumObject) {
        throw new Error(`Couldn't find ${type.id} in classes.`);
      }
      enumObject.addEnum(this);
    }
  }

  add(value: Quad) {
    const comment = GetComment(value);
    if (comment) {
      if (this.comment) {
        Log(
          `Duplicate comments provided on ${this.value.id} enum but one already exists. It will be overwritten.`,
        );
      }
      this.comment = comment.comment;
      return true;
    }

    return false;
  }

  toTypeLiteral(context: Context): TypeNode[] {
    const types = [this.value.id];

    if (this.value.id.startsWith('http:')) {
      types.push(this.value.id.replace(/^http:/, 'https:'));
    }

    const scoped = context.getScopedName(this.value);
    if (scoped !== this.value.id) {
      types.push(scoped);
    }

    return types.map(t =>
      factory.createLiteralTypeNode(factory.createStringLiteral(t)),
    );
  }
}
