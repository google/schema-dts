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
import {
  createIntersectionTypeNode,
  createModifiersFromModifierFlags,
  createObjectLiteral,
  createParenthesizedType,
  createTypeAliasDeclaration,
  createTypeLiteralNode,
  createTypeReferenceNode,
  createUnionTypeNode,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement,
  DeclarationStatement,
  ModifierFlags,
  NodeFlags,
  Statement,
  TypeAliasDeclaration,
  TypeNode,
  VariableStatement,
} from 'typescript';

import {Log} from '../logging';
import {TObject, TPredicate, TSubject} from '../triples/triple';
import {UrlNode} from '../triples/types';
import {
  GetComment,
  GetSubClassOf,
  IsSupersededBy,
  IsClassType,
} from '../triples/wellKnown';

import {Context} from './context';
import {EnumValue} from './enum';
import {Property, TypeProperty} from './property';
import {arrayOf} from './util/arrayof';
import {withComments} from './util/comments';
import {toClassName} from './util/names';
import {assert} from '../util/assert';
import {IdReferenceName} from './helper_types';

/** Maps fully qualified IDs of each Class to the class itself. */
export type ClassMap = Map<string, Class>;

/**
 * Represents a "Class" in Schema.org, except in cases where it is better
 * described by Builtin (i.e. is a DataType).
 *
 * In TypeScript, this corresponds to a collection of declarations:
 * 1. If the class has enum values, an Enum declaration.
 * 2. If the class has properties, the properties in an object literal.
 * 3. If the class has children,
 *        a type union over all children.
 *    otherwise, a "type" property.
 */
export class Class {
  private _comment?: string;
  private _typedef?: string;
  private readonly children: Class[] = [];
  private readonly _parents: Class[] = [];
  private readonly _props: Set<Property> = new Set();
  private readonly _enums: Set<EnumValue> = new Set();
  private readonly _supersededBy: Set<Class> = new Set();

  private allParents(): readonly Class[] {
    return this._parents;
  }
  private namedParents(): readonly string[] {
    return this._parents
      .map(p => p.baseName())
      .filter((name): name is string => !!name);
  }

  isNodeType(): boolean {
    if (this instanceof Builtin) return false;
    if (this._props.size > 0) return true;

    return this.allParents().every(n => n.isNodeType());
  }

  get deprecated() {
    return this._supersededBy.size > 0;
  }

  protected get comment() {
    if (!this.deprecated) return this._comment;
    const deprecated = `@deprecated Use ${this.supersededBy()
      .map(c => c.className())
      .join(' or ')} instead.`;
    return this._comment ? `${this._comment}\n${deprecated}` : deprecated;
  }

  protected get typedefs(): string[] {
    const parents = this.allParents().flatMap(p => p.typedefs);
    return Array.from(
      new Set(this._typedef ? [this._typedef, ...parents] : parents)
    ).sort();
  }

  private properties() {
    return Array.from(this._props.values()).sort((a, b) =>
      CompareKeys(a.key, b.key)
    );
  }

  private supersededBy() {
    return Array.from(this._supersededBy).sort((a, b) =>
      CompareKeys(a.subject, b.subject)
    );
  }

  private enums() {
    return Array.from(this._enums).sort((a, b) =>
      CompareKeys(a.value, b.value)
    );
  }

  private baseName(): string | undefined {
    // If Skip Base, we use the parent type instead.
    if (this.skipBase()) {
      if (this.namedParents().length === 0) return undefined;
      assert(this.namedParents().length === 1);
      return this.namedParents()[0];
    }

    return toClassName(this.subject) + 'Base';
  }

  private leafName(): string | undefined {
    // If the leaf has no node type and doesn't refer to any parent,
    // skip defining it.
    if (!this.isNodeType() && this.namedParents().length === 0) {
      return undefined;
    }

    return toClassName(this.subject) + 'Leaf';
  }

  className() {
    return toClassName(this.subject);
  }

  constructor(readonly subject: TSubject) {}
  add(
    value: {Predicate: TPredicate; Object: TObject},
    classMap: ClassMap
  ): boolean {
    const c = GetComment(value);
    if (c) {
      if (this._comment) {
        Log(
          `Duplicate comments provided on class ${this.subject.toString()}. It will be overwritten.`
        );
      }
      this._comment = c.comment;
      return true;
    }
    const s = GetSubClassOf(value);
    if (s) {
      // DataType subclasses rdfs:Class (since it too is a 'meta' type).
      // We don't represent this well right now, but we want to skip it.
      if (IsClassType(s.subClassOf)) return false;

      const parentClass = classMap.get(s.subClassOf.toString());
      if (parentClass) {
        this._parents.push(parentClass);
        parentClass.children.push(this);
      } else {
        throw new Error(
          `Couldn't find parent of ${
            this.subject.name
          }, ${s.subClassOf.toString()}`
        );
      }
      return true;
    }

    if (IsSupersededBy(value.Predicate)) {
      const supersededBy = classMap.get(value.Object.toString());
      if (!supersededBy) {
        throw new Error(
          `Couldn't find class ${value.Object.toString()}, which supersedes class ${
            this.subject.name
          }`
        );
      }
      this._supersededBy.add(supersededBy);
      return true;
    }

    return false;
  }

  addTypedef(typedef: string) {
    if (this._typedef) {
      throw new Error(
        `Class ${this.subject.href} already has typedef ${this._typedef} but we're also adding ${typedef}`
      );
    }
    this._typedef = typedef;
  }

  addProp(p: Property) {
    this._props.add(p);
  }
  addEnum(e: EnumValue) {
    this._enums.add(e);
  }

  private skipBase(): boolean {
    if (!this.isNodeType()) return true;
    return this.namedParents().length === 1 && this._props.size === 0;
  }

  private baseNode(
    skipDeprecatedProperties: boolean,
    context: Context
  ): TypeNode | undefined {
    if (this.skipBase()) {
      return undefined;
    }

    const parentTypes = this.namedParents().map(p =>
      createTypeReferenceNode(p, [])
    );
    const parentNode =
      parentTypes.length === 0
        ? createTypeReferenceNode('Partial', [
            createTypeReferenceNode(IdReferenceName, /*typeArguments=*/ []),
          ])
        : parentTypes.length === 1
        ? parentTypes[0]
        : createParenthesizedType(createIntersectionTypeNode(parentTypes));

    // Properties part.
    const propLiteral = createTypeLiteralNode([
      // ... then everything else.
      ...this.properties()
        .filter(property => !property.deprecated || !skipDeprecatedProperties)
        .map(prop => prop.toNode(context)),
    ]);

    if (propLiteral.members.length > 0) {
      return createIntersectionTypeNode([parentNode, propLiteral]);
    } else {
      return parentNode;
    }
  }

  private baseDecl(
    skipDeprecatedProperties: boolean,
    context: Context
  ): TypeAliasDeclaration | undefined {
    const baseNode = this.baseNode(skipDeprecatedProperties, context);

    if (!baseNode) return undefined;
    const baseName = this.baseName();
    assert(baseName, 'If a baseNode is defined, baseName must be defined.');

    return createTypeAliasDeclaration(
      /*decorators=*/ [],
      /*modifiers=*/ [],
      baseName,
      /*typeParameters=*/ [],
      baseNode
    );
  }

  protected leafDecl(context: Context): TypeAliasDeclaration | undefined {
    const leafName = this.leafName();
    if (!leafName) return undefined;

    const baseName = this.baseName();
    // Leaf is missing if !isNodeType || namedParents.length == 0
    // Base is missing if !isNodeType && namedParents.length == 0 && numProps == 0
    //
    // so when "Leaf" is present, Base will always be present.
    assert(baseName, 'Expect baseName to exist when leafName exists.');
    const baseTypeReference = createTypeReferenceNode(
      baseName,
      /*typeArguments=*/ []
    );

    const thisType = createIntersectionTypeNode([
      createTypeLiteralNode([new TypeProperty(this.subject).toNode(context)]),
      baseTypeReference,
    ]);

    return createTypeAliasDeclaration(
      /*decorators=*/ [],
      /*modifiers=*/ [],
      leafName,
      /*typeParameters=*/ [],
      thisType
    );
  }

  protected nonEnumType(skipDeprecated: boolean): TypeNode[] {
    this.children.sort((a, b) => CompareKeys(a.subject, b.subject));
    const children = this.children
      .filter(child => !(child.deprecated && skipDeprecated))
      .map(child =>
        createTypeReferenceNode(child.className(), /*typeArguments=*/ [])
      );

    // A type can have a valid typedef, add that if so.
    children.push(
      ...this.typedefs.map(t => createTypeReferenceNode(t, /*typeArgs=*/ []))
    );

    const upRef = this.leafName() || this.baseName();
    return upRef
      ? [createTypeReferenceNode(upRef, /*typeArgs=*/ []), ...children]
      : children;
  }

  private totalType(context: Context, skipDeprecated: boolean): TypeNode {
    const isEnum = this._enums.size > 0;

    if (isEnum) {
      return createUnionTypeNode([
        ...this.enums().flatMap(e => e.toTypeLiteral(context)),
        ...this.nonEnumType(skipDeprecated),
      ]);
    } else {
      return createUnionTypeNode(this.nonEnumType(skipDeprecated));
    }
  }

  private enumDecl(): VariableStatement | undefined {
    if (this._enums.size === 0) return undefined;
    const enums = this.enums();

    return createVariableStatement(
      createModifiersFromModifierFlags(ModifierFlags.Export),
      createVariableDeclarationList(
        [
          createVariableDeclaration(
            this.className(),
            /*type=*/ undefined,
            createObjectLiteral(
              enums.map(e => e.toNode()),
              /*multiLine=*/ true
            )
          ),
        ],
        NodeFlags.Const
      )
    );
  }

  toNode(context: Context, skipDeprecated: boolean): readonly Statement[] {
    const typeValue: TypeNode = this.totalType(context, skipDeprecated);
    const declaration = withComments(
      this.comment,
      createTypeAliasDeclaration(
        /* decorators = */ [],
        createModifiersFromModifierFlags(ModifierFlags.Export),
        this.className(),
        [],
        typeValue
      )
    );

    // Guide to Code Generated:
    // // Base: Always There -----------------------//
    // type XyzBase = (Parents) & {
    //   ... props;
    // };
    // // Leaf:
    // export type XyzLeaf = XyzBase & {
    //   '@type': 'Xyz'
    // }
    // // Complete Type ----------------------------//
    // export type Xyz = "Enum1"|"Enum2"|...        // Enum Piece: Optional.
    //                  |XyzLeaf                    // 'Leaf' Piece.
    //                  |Child1|Child2|...          // Child Piece: Optional.
    // // Enum Values: Optional --------------------//
    // export const Xyz = {
    //   Enum1 = "Enum1" as const,
    //   Enum2 = "Enum2" as const,
    //   ...
    // }
    // //-------------------------------------------//
    return arrayOf<Statement>(
      this.baseDecl(skipDeprecated, context),
      this.leafDecl(context),
      declaration,
      this.enumDecl()
    );
  }
}

/**
 * Represents a DataType.
 */
export class Builtin extends Class {}

/**
 * A "Native" Schema.org object that is best represented
 * in JSON-LD and JavaScript as a typedef to a native type.
 */
export class AliasBuiltin extends Builtin {
  constructor(url: string, equivTo: string) {
    super(UrlNode.Parse(url));
    this.addTypedef(equivTo);
  }
}

export class DataTypeUnion extends Builtin {
  constructor(url: string, readonly wk: Builtin[]) {
    super(UrlNode.Parse(url));
  }

  toNode(): DeclarationStatement[] {
    this.wk.sort(Sort);

    return [
      withComments(
        this.comment,
        createTypeAliasDeclaration(
          /*decorators=*/ [],
          createModifiersFromModifierFlags(ModifierFlags.Export),
          this.subject.name,
          /*typeParameters=*/ [],
          createUnionTypeNode(
            this.wk.map(wk =>
              createTypeReferenceNode(wk.subject.name, /*typeArguments=*/ [])
            )
          )
        )
      ),
    ];
  }
}

/**
 * Defines a Sort order between Class declarations.
 *
 * DataTypes come first, next the 'DataType' union itself, followed by all
 * regular classes. Within each group, class names are ordered alphabetically in
 * UTF-16 code units order.
 */
export function Sort(a: Class, b: Class): number {
  if (a instanceof Builtin && !(a instanceof DataTypeUnion)) {
    if (b instanceof Builtin && !(b instanceof DataTypeUnion)) {
      return CompareKeys(a.subject, b.subject);
    } else {
      return -1;
    }
  } else if (b instanceof Builtin && !(b instanceof DataTypeUnion)) {
    return +1;
  } else if (a instanceof DataTypeUnion) {
    return b instanceof DataTypeUnion ? 0 : -1;
  } else if (b instanceof DataTypeUnion) {
    // If we are here, a is never a DataTypeUnion.
    return +1;
  } else {
    return CompareKeys(a.subject, b.subject);
  }
}

function CompareKeys(a: TSubject, b: TSubject): number {
  const byName = a.name.localeCompare(b.name);
  if (byName !== 0) return byName;

  return a.href.localeCompare(b.href);
}
