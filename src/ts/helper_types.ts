import {
  createTypeAliasDeclaration,
  createTypeParameterDeclaration,
  createUnionTypeNode,
  createTypeReferenceNode,
  createTypeOperatorNode,
  createArrayTypeNode,
  SyntaxKind,
  createTypeLiteralNode,
  createPropertySignature,
  createStringLiteral,
} from 'typescript';

import {withComments} from './util/comments';

function IdPropertyNode() {
  return withComments(
    'IRI identifying the canonical address of this object.',
    createPropertySignature(
      /* modifiers= */ [],
      createStringLiteral('@id'),
      /* questionToken= */ undefined,
      /* typeNode= */
      createTypeReferenceNode('string', /*typeArguments=*/ []),
      /* initializer= */ undefined
    )
  );
}

export const SchemaValueName = 'SchemaValue';
export const IdReferenceName = 'IdReference';

export function HelperTypes() {
  return [
    createTypeAliasDeclaration(
      /*decorators=*/ [],
      /*modifiers=*/ [],
      SchemaValueName,
      [createTypeParameterDeclaration('T')],
      createUnionTypeNode([
        createTypeReferenceNode('T', /*typeArguments=*/ []),
        createTypeOperatorNode(
          SyntaxKind.ReadonlyKeyword,
          createArrayTypeNode(
            createTypeReferenceNode('T', /*typeArguments=*/ [])
          )
        ),
      ])
    ),
    createTypeAliasDeclaration(
      /*decorators=*/ [],
      /*modifiers=*/ [],
      IdReferenceName,
      /*typeParameters=*/ [],
      createTypeLiteralNode([IdPropertyNode()])
    ),
  ];
}
