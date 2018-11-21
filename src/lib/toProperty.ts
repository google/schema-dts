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
import {createArrayTypeNode, createKeywordTypeNode, createPropertySignature, createStringLiteral, createToken, createTypeReferenceNode, createUnionTypeNode, PropertySignature, SyntaxKind, TypeNode} from 'typescript';

import {withComments} from './comments';
import {toTypeName} from './names';
import {TObject, TPredicate, TSubject} from './triple';
import {GetComment, GetType, IsRangeIncludes} from './wellKnown';

export class PropertyType {
  comment?: string;
  readonly types: TObject[] = [];
  constructor(readonly subect: TSubject, object?: TObject) {
    if (object) this.types.push(object);
  }

  add(value: {Predicate: TPredicate; Object: TObject}): boolean {
    const c = GetComment(value);
    if (c) {
      if (this.comment) {
        throw new Error(`Attempting to add comment on property ${
            this.subect.toString()} but one already exists.`);
      }
      this.comment = c.comment;
      return true;
    }
    if (GetType(value)) return true;  // We used types already.

    if (IsRangeIncludes(value.Predicate)) {
      this.types.push(value.Object);
      return true;
    }

    return false;
  }
}

export class Property {
  constructor(
      private readonly key: string, private readonly type: PropertyType) {}

  required() {
    return this.key.startsWith('@');
  }

  private typeNode() {
    const node = this.scalarTypeNode();
    return this.key.startsWith('@') ?
        node :
        createUnionTypeNode([node, createArrayTypeNode(node)]);
  }

  private scalarTypeNode() {
    const typeNodes = this.type.types.map(
        type => createTypeReferenceNode(toTypeName(type), []));
    switch (typeNodes.length) {
      case 0:
        return createKeywordTypeNode(SyntaxKind.NeverKeyword);
      case 1:
        return typeNodes[0];
      default:
        return createUnionTypeNode(typeNodes);
    }
  }

  toNode(): PropertySignature {
    return withComments(
        this.type.comment,
        createPropertySignature(
            /* modifiers= */[],
            createStringLiteral(this.key),
            this.required() ? undefined : createToken(SyntaxKind.QuestionToken),
            /*typeNode=*/this.typeNode(),
            /*initializer=*/undefined,
            ));
  }
}
