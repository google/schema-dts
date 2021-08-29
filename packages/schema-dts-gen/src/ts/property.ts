/**
 * Copyright 2021 Google LLC
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
import type {PropertySignature} from 'typescript';
const {factory, SyntaxKind} = ts;

import {Log} from '../logging/index.js';
import {Format, ObjectPredicate, TObject, TSubject} from '../triples/triple.js';
import {
  GetComment,
  IsDomainIncludes,
  IsRangeIncludes,
  IsSupersededBy,
  IsTypeName,
} from '../triples/wellKnown.js';

import type {Class, ClassMap} from './class.js';
import {Context} from './context.js';
import {appendLine, withComments} from './util/comments.js';
import {IdReferenceName, SchemaValueReference} from './helper_types.js';
import {typeUnion} from './util/union.js';

/**
 * A "class" of properties, not associated with any particuar object.
 */
export class PropertyType {
  private readonly types: Class[] = [];
  private _comment?: string;
  private readonly _supersededBy: TObject[] = [];

  constructor(private readonly subject: TSubject) {}

  get comment() {
    if (!this.deprecated) return this._comment;
    const deprecated = `@deprecated Consider using ${this._supersededBy
      .map(o => o.toString())
      .join(' or ')} instead.`;

    return appendLine(this._comment, deprecated);
  }

  get deprecated() {
    return this._supersededBy.length > 0;
  }

  add(value: ObjectPredicate, classes: ClassMap): boolean {
    const c = GetComment(value);
    if (c) {
      if (this._comment) {
        Log(
          `Duplicate comments provided on property ${this.subject.toString()}. It will be overwritten.`
        );
      }
      this._comment = c.comment;
      return true;
    }

    if (IsRangeIncludes(value.Predicate)) {
      if (!IsTypeName(value.Object)) {
        throw new Error(
          `Type expected to be a UrlNode always. When adding ${Format(
            value
          )} to ${this.subject.toString()}.`
        );
      }
      const cls = classes.get(value.Object.toString());
      if (!cls) {
        throw new Error(`Could not find class for ${value.Object.toString()}`);
      }
      this.types.push(cls);
      return true;
    }

    if (IsDomainIncludes(value.Predicate)) {
      const cls = classes.get(value.Object.toString());
      if (!cls) {
        throw new Error(
          `Could not find class for ${this.subject.name}, ${Format(value)}.`
        );
      }
      cls.addProp(new Property(this.subject, this));
      return true;
    }

    if (IsSupersededBy(value.Predicate)) {
      this._supersededBy.push(value.Object);
      return true;
    }

    return false;
  }

  scalarTypeNode() {
    const typeNames = this.types.map(cls => cls.className()).sort();
    if (this.types.some(cls => cls.isNodeType())) {
      typeNames.push(IdReferenceName);
    }

    const typeNodes = typeNames.map(type =>
      factory.createTypeReferenceNode(type, /*typeArguments=*/ [])
    );

    return typeUnion(...typeNodes);
  }
}

/**
 * A Property on a particular object.
 */
export class Property {
  constructor(readonly key: TSubject, private readonly type: PropertyType) {}

  get deprecated() {
    return this.type.deprecated;
  }

  private typeNode(context: Context, properties: {hasRole: boolean}) {
    return SchemaValueReference(
      properties,
      () => this.type.scalarTypeNode(),
      context.getScopedName(this.key)
    );
  }

  toNode(context: Context, properties: {hasRole: boolean}): PropertySignature {
    return withComments(
      this.type.comment,
      factory.createPropertySignature(
        /* modifiers= */ [],
        factory.createStringLiteral(context.getScopedName(this.key)),
        factory.createToken(SyntaxKind.QuestionToken),
        /*typeNode=*/ this.typeNode(context, properties)
      )
    );
  }
}

export class TypeProperty {
  constructor(private readonly className: TSubject) {}

  toNode(context: Context) {
    return factory.createPropertySignature(
      /* modifiers= */ [],
      factory.createStringLiteral('@type'),
      /* questionToken= */ undefined,
      /* typeNode= */
      factory.createTypeReferenceNode(
        `"${context.getScopedName(this.className)}"`,
        /*typeArguments=*/ undefined
      )
    );
  }

  readonly deprecated = false;
}
