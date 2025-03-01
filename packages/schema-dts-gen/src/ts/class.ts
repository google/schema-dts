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
import type {
  DeclarationStatement,
  Statement,
  TypeNode,
  InterfaceDeclaration,
  TypeParameterDeclaration,
} from 'typescript';

const {factory, ModifierFlags, SyntaxKind} = ts;

import {Log} from '../logging/index.js';

import {namedPortion, namedPortionOrEmpty} from '../triples/term_utils.js';

import {
  GetComment,
  GetSubClassOf,
  IsSupersededBy,
  IsClassType,
} from '../triples/wellKnown.js';

import {Context} from './context.js';
import {EnumValue} from './enum.js';
import {Property, TypeProperty} from './property.js';
import {arrayOf} from './util/arrayof.js';
import {appendParagraph, withComments} from './util/comments.js';
import {toClassName} from './util/names.js';
import {assert} from '../util/assert.js';
import {IdReferenceName} from './helper_types.js';
import {typeUnion} from './util/union.js';
import {NamedNode, Quad} from 'n3';

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
  private _typedefs: TypeNode[] = [];
  private _isDataType = false;
  private _explicitlyMarkedAsClass = false;
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
    if (this._isDataType) return false;
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

    return appendParagraph(this._comment, deprecated);
  }

  protected get typedefs(): TypeNode[] {
    const parents = this.allParents().flatMap(p => p.typedefs);
    return Array.from(
      new Map([...this._typedefs, ...parents].map(t => [JSON.stringify(t), t])),
    )
      .sort(([key1], [key2]) => key1.localeCompare(key2))
      .map(([_, value]) => value);
  }

  private properties() {
    return Array.from(this._props.values()).sort((a, b) =>
      CompareKeys(a.key, b.key),
    );
  }

  private supersededBy() {
    return Array.from(this._supersededBy).sort((a, b) =>
      CompareKeys(a.subject, b.subject),
    );
  }

  private enums() {
    return Array.from(this._enums).sort((a, b) =>
      CompareKeys(a.value, b.value),
    );
  }

  protected baseName(): string | undefined {
    // If Skip Base, we use the parent type instead.
    if (this.skipBase()) {
      if (this.namedParents().length === 0) return undefined;
      assert(this.namedParents().length === 1);
      return this.namedParents()[0];
    }

    return toClassName(this.subject) + 'Base';
  }

  protected leafName(): string | undefined {
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

  constructor(readonly subject: NamedNode) {}
  add(value: Quad, classMap: ClassMap): boolean {
    const c = GetComment(value);
    if (c) {
      if (this._comment) {
        Log(
          `Duplicate comments provided on class ${this.subject.id}. It will be overwritten.`,
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

      const parentClass = classMap.get(s.subClassOf.id);
      if (parentClass) {
        this._parents.push(parentClass);
        parentClass.children.push(this);
      } else {
        throw new Error(
          `Couldn't find parent of ${this.subject.value}, ${
            s.subClassOf.value
          } (available: ${Array.from(classMap.keys()).join(', ')})`,
        );
      }
      return true;
    }

    if (IsSupersededBy(value.predicate)) {
      const supersededBy = classMap.get(value.object.value);
      if (!supersededBy) {
        throw new Error(
          `Couldn't find class ${value.object.value}, which supersedes class ${this.subject.value}`,
        );
      }
      this._supersededBy.add(supersededBy);
      return true;
    }

    return false;
  }

  addTypedef(typedef: TypeNode) {
    this._typedefs.push(typedef);
  }
  markAsExplicitClass() {
    this._explicitlyMarkedAsClass = true;
  }
  private isMarkedAsClass(visited: WeakSet<Class>): boolean {
    if (visited.has(this)) return false;
    visited.add(this);

    return (
      this._explicitlyMarkedAsClass ||
      this._parents.some(p => p.isMarkedAsClass(visited))
    );
  }
  validateClass(): void {
    if (!this.isMarkedAsClass(new WeakSet())) {
      throw new Error(
        `Class ${this.className()} is not marked as an rdfs:Class, and neither are any of its parents.`,
      );
    }
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

  private baseDecl(
    context: Context,
    properties: {skipDeprecatedProperties: boolean; hasRole: boolean},
  ): InterfaceDeclaration | undefined {
    if (this.skipBase()) {
      return undefined;
    }

    const baseName = this.baseName();
    assert(baseName, 'If a baseNode is defined, baseName must be defined.');

    const parentTypes = this.namedParents().map(p =>
      factory.createExpressionWithTypeArguments(
        factory.createIdentifier(p),
        [],
      ),
    );

    const heritage = factory.createHeritageClause(
      SyntaxKind.ExtendsKeyword,
      parentTypes.length === 0
        ? [
            factory.createExpressionWithTypeArguments(
              factory.createIdentifier('Partial'),
              /*typeArguments=*/ [
                factory.createTypeReferenceNode(
                  IdReferenceName,
                  /*typeArguments=*/ [],
                ),
              ],
            ),
          ]
        : parentTypes,
    );

    const members = this.properties()
      .filter(
        property =>
          !property.deprecated || !properties.skipDeprecatedProperties,
      )
      .map(prop => prop.toNode(context, properties));

    return factory.createInterfaceDeclaration(
      /*modifiers=*/ [],
      baseName,
      /*typeParameters=*/ [],
      /*heritageClause=*/ [heritage],
      /*members=*/ members,
    );
  }

  protected leafDecl(context: Context): DeclarationStatement | undefined {
    const leafName = this.leafName();
    if (!leafName) return undefined;

    const baseName = this.baseName();
    // Leaf is missing if !isNodeType || namedParents.length == 0
    // Base is missing if !isNodeType && namedParents.length == 0 && numProps == 0
    //
    // so when "Leaf" is present, Base will always be present.
    assert(baseName, 'Expect baseName to exist when leafName exists.');

    return factory.createInterfaceDeclaration(
      /*modifiers=*/ [],
      leafName,
      /*typeParameters=*/ [],
      /*heritage=*/ [
        factory.createHeritageClause(SyntaxKind.ExtendsKeyword, [
          factory.createExpressionWithTypeArguments(
            factory.createIdentifier(baseName),
            /*typeArguments=*/ [],
          ),
        ]),
      ],
      /*members=*/ [new TypeProperty(this.subject).toNode(context)],
    );
  }

  protected nonEnumType(skipDeprecated: boolean): TypeNode[] {
    this.children.sort((a, b) => CompareKeys(a.subject, b.subject));
    const children: TypeNode[] = this.children
      .filter(child => !(child.deprecated && skipDeprecated))
      .map(child =>
        factory.createTypeReferenceNode(
          child.className(),
          /*typeArguments=*/ child.typeArguments(this.typeParameters()),
        ),
      );

    // A type can have a valid typedef, add that if so.
    children.push(...this.typedefs);

    const upRef = this.leafName() || this.baseName();
    const typeArgs = this.leafName() ? this.leafTypeArguments() : [];

    return upRef
      ? [factory.createTypeReferenceNode(upRef, typeArgs), ...children]
      : children;
  }

  private totalType(context: Context, skipDeprecated: boolean): TypeNode {
    return typeUnion(
      ...this.enums().flatMap(e => e.toTypeLiteral(context)),
      ...this.nonEnumType(skipDeprecated),
    );
  }

  /** Generic Type Parameter Declarations for this class */
  protected typeParameters(): readonly TypeParameterDeclaration[] {
    return [];
  }

  /** Generic Types to pass to this total type when referencing it. */
  protected typeArguments(
    _: readonly TypeParameterDeclaration[],
  ): readonly TypeNode[] {
    return [];
  }

  protected leafTypeArguments(): readonly TypeNode[] {
    return [];
  }

  toNode(
    context: Context,
    properties: {skipDeprecatedProperties: boolean; hasRole: boolean},
  ): readonly Statement[] {
    const typeValue: TypeNode = this.totalType(
      context,
      properties.skipDeprecatedProperties,
    );
    const declaration = withComments(
      this.comment,
      factory.createTypeAliasDeclaration(
        factory.createModifiersFromModifierFlags(ModifierFlags.Export),
        this.className(),
        this.typeParameters(),
        typeValue,
      ),
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
    // //-------------------------------------------//
    return arrayOf<Statement>(
      this.baseDecl(context, properties),
      this.leafDecl(context),
      declaration,
    );
  }
}

/**
 * Represents a DataType.
 */
export class Builtin extends Class {
  constructor(subject: NamedNode) {
    super(subject);
    this.markAsExplicitClass();
  }
}

/**
 * A "Native" Schema.org object that is best represented
 * in JSON-LD and JavaScript as a typedef to a native type.
 */
export class AliasBuiltin extends Builtin {
  constructor(subject: NamedNode, ...equivTo: TypeNode[]) {
    super(subject);
    for (const t of equivTo) this.addTypedef(t);
  }

  static Alias(equivTo: string): TypeNode {
    return factory.createTypeReferenceNode(equivTo, /*typeArgs=*/ []);
  }

  static NumberStringLiteral(): TypeNode {
    return factory.createTemplateLiteralType(
      factory.createTemplateHead(/* text= */ ''),
      [
        factory.createTemplateLiteralTypeSpan(
          factory.createTypeReferenceNode('number'),
          factory.createTemplateTail(/* text= */ ''),
        ),
      ],
    );
  }
}

export class RoleBuiltin extends Builtin {
  private static readonly kContentTypename = 'TContent';
  private static readonly kPropertyTypename = 'TProperty';

  protected typeParameters(): readonly TypeParameterDeclaration[] {
    return [
      factory.createTypeParameterDeclaration(
        /*modifiers=*/ [],
        /*name=*/ RoleBuiltin.kContentTypename,
        /*constraint=*/ undefined,
        /*default=*/ factory.createTypeReferenceNode('never'),
      ),
      factory.createTypeParameterDeclaration(
        /*modifiers=*/ [],
        /*name=*/ RoleBuiltin.kPropertyTypename,
        /*constraint=*/ factory.createTypeReferenceNode('string'),
        /*default=*/ factory.createTypeReferenceNode('never'),
      ),
    ];
  }

  protected leafTypeArguments(): readonly TypeNode[] {
    return [
      factory.createTypeReferenceNode(RoleBuiltin.kContentTypename),
      factory.createTypeReferenceNode(RoleBuiltin.kPropertyTypename),
    ];
  }

  protected typeArguments(
    availableParams: readonly TypeParameterDeclaration[],
  ): TypeNode[] {
    const hasTContent = !!availableParams.find(
      param => param.name.text === RoleBuiltin.kContentTypename,
    );
    const hasTProperty = !!availableParams.find(
      param => param.name.text === RoleBuiltin.kPropertyTypename,
    );

    assert(
      (hasTProperty && hasTContent) || (!hasTProperty && !hasTContent),
      `hasTcontent and hasTProperty should be both true or both false, but saw (${hasTContent}, ${hasTProperty})`,
    );

    return hasTContent && hasTProperty
      ? [
          factory.createTypeReferenceNode(RoleBuiltin.kContentTypename),
          factory.createTypeReferenceNode(RoleBuiltin.kPropertyTypename),
        ]
      : [];
  }

  protected leafDecl(context: Context): DeclarationStatement {
    const leafName = this.leafName();
    const baseName = this.baseName();
    assert(leafName, 'Role must have Leaf Name');
    assert(baseName, 'Role must have Base Name.');

    return factory.createTypeAliasDeclaration(
      /*modifiers=*/ [],
      leafName,
      /*typeParameters=*/ [
        factory.createTypeParameterDeclaration(
          /*modifiers=*/ [],
          /*name=*/ RoleBuiltin.kContentTypename,
          /*constraint=*/ undefined,
        ),
        factory.createTypeParameterDeclaration(
          /*modifiers=*/ [],
          /*name=*/ RoleBuiltin.kPropertyTypename,
          /*constraint=*/ factory.createTypeReferenceNode('string'),
        ),
      ],
      /*type=*/
      factory.createIntersectionTypeNode([
        factory.createTypeReferenceNode(baseName),
        factory.createTypeLiteralNode([
          new TypeProperty(this.subject).toNode(context),
        ]),
        factory.createMappedTypeNode(
          /*initialToken=*/ undefined,
          /*typeParameter=*/ factory.createTypeParameterDeclaration(
            /*modifiers=*/ [],
            'key',
            /*constraint=*/ factory.createTypeReferenceNode(
              RoleBuiltin.kPropertyTypename,
            ),
          ),
          /*nameType=*/ undefined,
          /*questionToken=*/ undefined,
          /*type=*/ factory.createTypeReferenceNode(
            RoleBuiltin.kContentTypename,
          ),
          /*members=*/ undefined,
        ),
      ]),
    );
  }
}

export class DataTypeUnion extends Builtin {
  constructor(
    subject: NamedNode,
    readonly wk: Builtin[],
  ) {
    super(subject);
  }

  toNode(): DeclarationStatement[] {
    this.wk.sort(Sort);

    return [
      withComments(
        this.comment,
        factory.createTypeAliasDeclaration(
          factory.createModifiersFromModifierFlags(ModifierFlags.Export),
          namedPortion(this.subject),
          /*typeParameters=*/ [],
          factory.createUnionTypeNode(
            this.wk.map(wk =>
              factory.createTypeReferenceNode(
                namedPortion(wk.subject),
                /*typeArguments=*/ [],
              ),
            ),
          ),
        ),
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

function CompareKeys(a: NamedNode, b: NamedNode): number {
  const byName = (namedPortionOrEmpty(a) || '').localeCompare(
    namedPortionOrEmpty(b) || '',
  );
  if (byName !== 0) return byName;

  return a.id.localeCompare(b.id);
}
