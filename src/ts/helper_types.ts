import {factory, ModifierFlags, SyntaxKind} from 'typescript';
import {Context} from './context';

import {withComments} from './util/comments';

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
  // export type WithContent<T extends Thing> = T & { "@context": TYPE_NODE }
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

export const SchemaValueName = 'SchemaValue';
export const IdReferenceName = 'IdReference';

export function HelperTypes(context: Context) {
  return [
    WithContextType(context),
    factory.createTypeAliasDeclaration(
      /*decorators=*/ [],
      /*modifiers=*/ [],
      SchemaValueName,
      [factory.createTypeParameterDeclaration('T')],
      factory.createUnionTypeNode([
        factory.createTypeReferenceNode('T', /*typeArguments=*/ []),
        factory.createTypeOperatorNode(
          SyntaxKind.ReadonlyKeyword,
          factory.createArrayTypeNode(
            factory.createTypeReferenceNode('T', /*typeArguments=*/ [])
          )
        ),
      ])
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
