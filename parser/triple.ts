import {
  SchemaObject,
  SchemaSource,
  W3CNameSpaced,
  RdfSchema,
  RdfSyntax,
  W3cSkos,
  SchemaString,
  Rdfs,
  WikidataConst
} from "./types";

export interface Triple {
  readonly Subject: SchemaObject | SchemaSource | W3CNameSpaced;
  readonly Predicate: RdfSchema | RdfSyntax | SchemaObject | W3cSkos;
  readonly Object:
    | SchemaObject
    | SchemaSource
    | SchemaString
    | RdfSchema
    | RdfSyntax
    | Rdfs
    | WikidataConst
    | W3CNameSpaced;
}
export type TSubject = Triple["Subject"];
export type TPredicate = Triple["Predicate"];
export type TObject = Triple["Object"];

export type ObjectPredicate = { Object: TObject; Predicate: TPredicate };
