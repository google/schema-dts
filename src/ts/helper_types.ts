import {factory, SyntaxKind} from 'typescript';

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

export const SchemaValueName = 'SchemaValue';
export const IdReferenceName = 'IdReference';

export function HelperTypes() {
  return [
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
