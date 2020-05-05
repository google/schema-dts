import {
  createTypeAliasDeclaration,
  createIdentifier,
  createTypeParameterDeclaration,
  createUnionTypeNode,
  createTypeReferenceNode,
  createTypeOperatorNode,
  createArrayTypeNode,
  SyntaxKind,
} from 'typescript';

export const SchemaValueName = 'SchemaValue';

export function HelperTypes() {
  return [
    createTypeAliasDeclaration(
      undefined,
      undefined,
      createIdentifier(SchemaValueName),
      [createTypeParameterDeclaration(createIdentifier('T'))],
      createUnionTypeNode([
        createTypeReferenceNode(createIdentifier('T'), undefined),
        createTypeOperatorNode(
          SyntaxKind.ReadonlyKeyword,
          createArrayTypeNode(
            createTypeReferenceNode(createIdentifier('T'), undefined)
          )
        ),
      ])
    ),
  ];
}
