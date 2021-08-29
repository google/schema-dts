import ts from 'typescript';
import type {TypeNode} from 'typescript';
const {factory, SyntaxKind, ModifierFlags} = ts;

import {Context} from './context.js';
import {arrayOf} from './util/arrayof.js';

import {withComments} from './util/comments.js';
import {typeUnion} from './util/union.js';

function IdPropertyNode() {
  return withComments(
    'IRI identifying the canonical address of this object.',
    factory.createPropertySignature(
      /* modifiers= */ [],
      factory.createStringLiteral('@id'),
      /* questionToken= */ undefined,
      /* typeNode= */
      factory.createTypeReferenceNode('string', /*typeArguments=*/ [])
    )
  );
}

function WithContextType(context: Context) {
  // export type WithContext<T extends Thing> = T & { "@context": TYPE_NODE }
  return withComments(
    'Used at the top-level node to indicate the context for the JSON-LD ' +
      'objects used. The context provided in this type is compatible ' +
      'with the keys and URLs in the rest of this generated file.',
    factory.createTypeAliasDeclaration(
      /*decorators=*/ [],
      factory.createModifiersFromModifierFlags(ModifierFlags.Export),
      'WithContext',
      [
        factory.createTypeParameterDeclaration(
          'T' /*constraint=*/,
          factory.createTypeReferenceNode('Thing', /*typeArguments=*/ undefined)
        ),
      ],
      factory.createIntersectionTypeNode([
        factory.createTypeReferenceNode('T', /*typeArguments=*/ undefined),
        factory.createTypeLiteralNode([context.contextProperty()]),
      ])
    )
  );
}

function GraphType(context: Context) {
  return withComments(
    '',
    factory.createInterfaceDeclaration(
      /*decorators=*/ [],
      factory.createModifiersFromModifierFlags(ModifierFlags.Export),
      GraphTypeName,
      /*typeParameters=*/ undefined,
      /*heritageClauses=*/ undefined,
      [
        context.contextProperty(),
        factory.createPropertySignature(
          /*modifiers=*/ [],
          factory.createStringLiteral('@graph'),
          /*questionToken=*/ undefined,
          factory.createTypeOperatorNode(
            SyntaxKind.ReadonlyKeyword,
            factory.createArrayTypeNode(
              factory.createTypeReferenceNode(
                'Thing',
                /*typeArguments=*/ undefined
              )
            )
          )
        ),
      ]
    )
  );
}

const SchemaValueName = 'SchemaValue';
export const IdReferenceName = 'IdReference';
export const GraphTypeName = 'Graph';

export function SchemaValueReference(
  {hasRole}: {hasRole: boolean},
  makeScalarType: () => TypeNode,
  propertyName: string
) {
  return factory.createTypeReferenceNode(
    SchemaValueName,
    /* typeArguments = */ arrayOf(
      makeScalarType(),
      hasRole &&
        factory.createLiteralTypeNode(factory.createStringLiteral(propertyName))
    )
  );
}

export function HelperTypes(context: Context, {hasRole}: {hasRole: boolean}) {
  return [
    WithContextType(context),
    GraphType(context),
    factory.createTypeAliasDeclaration(
      /*decorators=*/ [],
      /*modifiers=*/ [],
      SchemaValueName,
      arrayOf(
        factory.createTypeParameterDeclaration('T'),
        hasRole &&
          factory.createTypeParameterDeclaration(
            'TProperty',
            /*constraint=*/ factory.createTypeReferenceNode('string')
          )
      ),
      factory.createUnionTypeNode(
        arrayOf<TypeNode>(
          factory.createTypeReferenceNode('T', /*typeArguments=*/ []),
          hasRole &&
            factory.createTypeReferenceNode('Role', [
              /*TContent=*/ factory.createTypeReferenceNode('T'),
              /*TProperty=*/ factory.createTypeReferenceNode('TProperty'),
            ]),
          factory.createTypeOperatorNode(
            SyntaxKind.ReadonlyKeyword,
            factory.createArrayTypeNode(
              typeUnion(
                factory.createTypeReferenceNode('T', /*typeArguments=*/ []),
                hasRole &&
                  factory.createTypeReferenceNode('Role', [
                    /*TContent=*/ factory.createTypeReferenceNode('T'),
                    /*TProperty=*/ factory.createTypeReferenceNode('TProperty'),
                  ])
              )
            )
          )
        )
      )
    ),
    factory.createTypeAliasDeclaration(
      /*decorators=*/ [],
      /*modifiers=*/ [],
      IdReferenceName,
      /*typeParameters=*/ [],
      factory.createTypeLiteralNode([IdPropertyNode()])
    ),
  ];
}
