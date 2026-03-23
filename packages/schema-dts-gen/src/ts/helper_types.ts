import ts from 'typescript';
import type {TypeNode} from 'typescript';
const {factory, SyntaxKind, ModifierFlags} = ts;

import {
  WithActionConstraintsType,
  InputActionConstraintsType,
  OutputActionConstraintsType,
} from './action_constraints.js';
import {Context} from './context.js';

import {arrayOf} from './util/arrayof.js';
import {withComments} from './util/comments.js';
import {typeUnion} from './util/union.js';

function WithContextType(context: Context) {
  // export interface WithContext<T extends JsonLdObject | string> extends Exclude<T, string> { "@context": TYPE_NODE }
  return withComments(
    'Used at the top-level node to indicate the context for the JSON-LD ' +
      'objects used. The context provided in this type is compatible ' +
      'with the keys and URLs in the rest of this generated file.',
    factory.createTypeAliasDeclaration(
      factory.createModifiersFromModifierFlags(ModifierFlags.Export),
      'WithContext',
      [
        factory.createTypeParameterDeclaration(
          /*modifiers=*/ [],
          'T' /*constraint=*/,
          factory.createUnionTypeNode([
            factory.createTypeReferenceNode(
              'JsonLdObject',
              /*typeArguments=*/ undefined,
            ),
            factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
          ]),
        ),
      ],
      factory.createIntersectionTypeNode([
        factory.createTypeReferenceNode('T', /*typeArguments=*/ undefined),
        factory.createTypeLiteralNode([context.contextProperty()]),
      ]),
    ),
  );
}

function GraphType(context: Context) {
  return withComments(
    '',
    factory.createInterfaceDeclaration(
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
                /*typeArguments=*/ undefined,
              ),
            ),
          ),
        ),
      ],
    ),
  );
}

const SchemaValueName = 'SchemaValue';
const MergeLeafTypesName = 'MergeLeafTypes';
export const IdReferenceName = 'IdReference';
export const GraphTypeName = 'Graph';

export function SchemaValueReference(
  {hasRole}: {hasRole: boolean},
  makeScalarType: () => TypeNode,
  propertyName: string,
) {
  return factory.createTypeReferenceNode(
    SchemaValueName,
    /* typeArguments = */ arrayOf(
      makeScalarType(),
      hasRole &&
        factory.createLiteralTypeNode(
          factory.createStringLiteral(propertyName),
        ),
    ),
  );
}

export function HelperTypes(context: Context, {hasRole}: {hasRole: boolean}) {
  return [
    factory.createImportDeclaration(
      /*modifiers=*/ [],
      factory.createImportClause(
        SyntaxKind.TypeKeyword,
        /*name=*/ undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            /*isTypeOnly=*/ false,
            /*propertyName=*/ undefined,
            /*name=*/ factory.createIdentifier('JsonLdObject'),
          ),
          factory.createImportSpecifier(
            /*isTypeOnly=*/ false,
            /*propertyName=*/ undefined,
            /*name=*/ factory.createIdentifier('IdReference'),
          ),
          factory.createImportSpecifier(
            /*isTypeOnly=*/ false,
            /*propertyName=*/ undefined,
            /*name=*/ factory.createIdentifier(MergeLeafTypesName),
          ),
        ]),
      ),
      factory.createStringLiteral('schema-dts-lib'),
    ),
    factory.createExportDeclaration(
      /*modifiers=*/ [],
      /*isTypeOnly=*/ true,
      factory.createNamedExports([
        factory.createExportSpecifier(
          /*isTypeOnly=*/ false,
          /*propertyName=*/ undefined,
          /*name=*/ factory.createIdentifier('JsonLdObject'),
        ),
        factory.createExportSpecifier(
          /*isTypeOnly=*/ false,
          /*propertyName=*/ undefined,
          /*name=*/ factory.createIdentifier('IdReference'),
        ),
        factory.createExportSpecifier(
          /*isTypeOnly=*/ false,
          /*propertyName=*/ undefined,
          /*name=*/ factory.createIdentifier(MergeLeafTypesName),
        ),
      ]),
    ),
    WithContextType(context),
    GraphType(context),
    factory.createTypeAliasDeclaration(
      /*modifiers=*/ [],
      SchemaValueName,
      arrayOf(
        factory.createTypeParameterDeclaration(/*modifiers=*/ [], 'T'),
        hasRole &&
          factory.createTypeParameterDeclaration(
            /*modifiers=*/ [],
            'TProperty',
            /*constraint=*/ factory.createTypeReferenceNode('string'),
          ),
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
                  ]),
              ),
            ),
          ),
        ),
      ),
    ),
    InputActionConstraintsType,
    OutputActionConstraintsType,
    WithActionConstraintsType,
  ];
}
