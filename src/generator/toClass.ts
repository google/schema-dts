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
import {createEnumDeclaration, createEnumMember, createIntersectionTypeNode, createKeywordTypeNode, createModifiersFromModifierFlags, createParenthesizedType, createStringLiteral, createTypeAliasDeclaration, createTypeLiteralNode, createTypeReferenceNode, createUnionTypeNode, EnumDeclaration, ModifierFlags, SyntaxKind, TypeNode} from 'typescript';

import {withComments} from './comments';
import {toClassName, toEnumName, toScopedName} from './names';
import {Property, PropertyType} from './toProperty';
import {ObjectPredicate, TObject, TPredicate, TSubject} from './triple';
import {SchemaObject, SchemaString} from './types';
import {GetComment, GetSubClassOf, GetType, IsClass, IsProperty, TTypeName} from './wellKnown';

export type ClassMap = Map<string, Class>;

export interface Grouped {
  Subject: TSubject;
  values: ObjectPredicate[];
}

export class Class {
  private comment?: string;
  private readonly parents: string[] = [];
  private readonly _props: Property[] = [];
  private readonly _enums: EnumValue[] = [];
  private isLeaf = true;

  properties() {
    return this.isLeaf ?
        [
          new Property(
              '@type',
              new PropertyType(
                  this.subject, new SchemaString(toScopedName(this.subject)))),
          ...this._props
        ] :
        this._props;
  }

  constructor(readonly subject: TSubject) {}
  add(value: {Predicate: TPredicate; Object: TObject},
      classMap: ClassMap): boolean {
    const c = GetComment(value);
    if (c) {
      if (this.comment) {
        throw new Error(`Trying to add comment on class ${
            this.subject.toString()} but one already exists.`);
      }
      this.comment = c.comment;
      return true;
    }
    const s = GetSubClassOf(value);
    if (s) {
      this.parents.push(toClassName(s.subClassOf));
      const parentClass = classMap.get(s.subClassOf.toString());
      if (parentClass) {
        parentClass.isLeaf = false;
      } else {
        throw new Error(`Couldn't find parent of ${this.subject.toString()}, ${
            s.subClassOf.toString()}`);
      }
      return true;
    }

    if (GetType(value)) return true;  // We used types already.

    return false;
  }
  addProp(p: Property) {
    this._props.push(p);
  }
  addEnum(e: EnumValue) {
    this._enums.push(e);
  }

  private nonEnumType(): TypeNode {
    // Parent Part.
    const parentTypes =
        this.parents.map(parent => createTypeReferenceNode(parent, []));
    const parentNode = parentTypes.length === 0 ?
        null :
        parentTypes.length === 1 ? parentTypes[0] :
                                   createUnionTypeNode(parentTypes);

    // Properties part.
    const propLiteral =
        createTypeLiteralNode(this.properties().map(prop => prop.toNode()));

    if (parentNode && propLiteral.members.length > 0) {
      return createIntersectionTypeNode([parentNode, propLiteral]);
    } else if (parentNode) {
      return parentNode;
    } else if (propLiteral.members.length > 0) {
      return propLiteral;
    } else {
      return createKeywordTypeNode(SyntaxKind.NeverKeyword);
    }
  }

  private totalType(): TypeNode {
    const isEnum = this._enums.length > 0;

    if (isEnum) {
      return createUnionTypeNode([
        createTypeReferenceNode(toClassName(this.subject) + 'Enum', []),
        createParenthesizedType(this.nonEnumType()),
      ]);
    } else {
      return this.nonEnumType();
    }
  }

  private enumType(): EnumDeclaration|undefined {
    if (this._enums.length === 0) return undefined;

    return createEnumDeclaration(
        /* decorators= */[],
        createModifiersFromModifierFlags(ModifierFlags.Export),
        toClassName(this.subject) + 'Enum', this._enums.map(e => e.toNode()));
  }

  toNode() {
    const typeValue: TypeNode = this.totalType();
    const enumType = this.enumType();
    const declaration = withComments(
        this.comment,
        createTypeAliasDeclaration(
            /* decorators = */[],
            createModifiersFromModifierFlags(ModifierFlags.Export),
            toClassName(this.subject),
            [],
            typeValue,
            ));

    return enumType ? [enumType, declaration] : [declaration];
  }
}

export class Builtin extends Class {
  constructor(
      private readonly name: string, private readonly equivTo: string,
      private readonly doc?: string) {
    super(new SchemaObject(name));
  }

  toNode() {
    return [createTypeAliasDeclaration(
        [], createModifiersFromModifierFlags(ModifierFlags.Export), this.name,
        [], createTypeReferenceNode(this.equivTo, []))];
  }
}

export class EnumValue {
  readonly INSTANCE = 'EnumValue';

  private comment?: string;
  constructor(private readonly value: TSubject) {}

  add(value: ObjectPredicate, map: ClassMap) {
    // First, "Type" containment.
    const type = GetType(value);
    if (type) {
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

export function toClass(cls: Class, group: Grouped, map: ClassMap): Class {
  const rest: ObjectPredicate[] = [];
  for (const value of group.values) {
    const added = cls.add(value, map);
    if (!added) rest.push(value);
  }
  return cls;
}

const wellKnownTypes = [
  new Builtin('Text', 'string'), new Builtin('Number', 'number'),
  new Builtin(
      'Time', 'string',
      'DateTime represented in string, e.g. 2017-01-04T17:10:00-05:00.'),
  new Builtin('Boolean', 'boolean')
];

export function ProcessIfClass(input: {type: TTypeName; decls: Grouped[];}):
    ClassMap|null {
  if (IsClass(input.type)) {
    const ret = new Map<string, Class>();
    for (const wk of wellKnownTypes) {
      ret.set(wk.subject.toString(), wk);
    }

    // Forward Declare once
    for (const clsD of input.decls) {
      const cls = new Class(clsD.Subject);
      ret.set(clsD.Subject.toString(), cls);
    }
    // Then build
    for (const clsD of input.decls) {
      const cls = ret.get(clsD.Subject.toString())!;
      toClass(cls, clsD, ret);
    }
    return ret;
  }

  if (IsProperty(input.type)) {
    return null;
  }
  return null;
}
export function ProcessClasses(
    input: Array<{type: TTypeName; decls: Grouped[]}>): ClassMap {
  for (const elem of input) {
    const result = ProcessIfClass(elem);
    if (result) {
      return result;
    }
  }
  throw new Error('Unexpected: Expected a class');
}

export function FindProperties(
    input: Array<{type: TTypeName; decls: Grouped[]}>): Grouped[] {
  for (const elem of input) {
    if (IsProperty(elem.type)) return elem.decls;
  }
  throw new Error('Unexpected: Expected a property');
}
