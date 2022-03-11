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
import {
  GetComment,
  IsDomainIncludes,
  IsRangeIncludes,
  IsSupersededBy,
  IsTypeName,
} from '../triples/wellKnown.js';

import type {Class, ClassMap} from './class.js';
import {Context} from './context.js';
import {appendParagraph, withComments} from './util/comments.js';
import {IdReferenceName, SchemaValueReference} from './helper_types.js';
import {typeUnion} from './util/union.js';

import type {NamedNode, Quad} from 'n3';
import {assertIs} from '../util/assert.js';

/**
 * A "class" of properties, not associated with any particuar object.
 */
export class PropertyType {
  private readonly types: Class[] = [];
  private _comment?: string;
  private readonly _supersededBy: NamedNode[] = [];

  constructor(private readonly subject: NamedNode) {}

  get comment() {
    if (!this.deprecated) return this._comment;
    const deprecated = `@deprecated Consider using ${this._supersededBy
      .map(o => o.id)
      .join(' or ')} instead.`;

    return appendParagraph(this._comment, deprecated);
  }

  get deprecated() {
    return this._supersededBy.length > 0;
  }

  add(value: Quad, classes: ClassMap): boolean {
    const c = GetComment(value);
    if (c) {
      if (this._comment) {
        Log(
          `Duplicate comments provided on property ${this.subject.id}. It will be overwritten.`
        );
      }
      this._comment = c.comment;
      return true;
    }

    if (IsRangeIncludes(value.predicate)) {
      if (!IsTypeName(value.object)) {
        throw new Error(
          `Type expected to be a UrlNode always. When adding ${JSON.stringify(
            value.toJSON(),
            undefined,
            2
          )}.`
        );
      }
      const cls = classes.get(value.object.id);
      if (!cls) {
        throw new Error(
          `Could not find class for ${value.object.id} [only foud: ${Array.from(
            classes.keys()
          ).join(', ')}]`
        );
      }
      this.types.push(cls);
      return true;
    }

    if (IsDomainIncludes(value.predicate)) {
      const cls = classes.get(value.object.id);
      if (!cls) {
        throw new Error(
          `Could not find class for ${
            value.object.id
          }. [only foud: ${Array.from(classes.keys()).join(', ')}]`
        );
      }
      cls.addProp(new Property(this.subject, this));
      return true;
    }

    if (IsSupersededBy(value.predicate)) {
      assertIs(value.object, (o): o is NamedNode => o.termType === 'NamedNode');
      this._supersededBy.push(value.object);
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
  constructor(readonly key: NamedNode, private readonly type: PropertyType) {}

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
  constructor(private readonly className: NamedNode) {}

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
