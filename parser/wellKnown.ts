import { ObjectPredicate, TSubject, TPredicate } from "./triple";
import {
  RdfSchema,
  SchemaObject,
  RdfSyntax,
  SchemaSource,
  W3CNameSpaced
} from "./types";
import { EROFS } from "constants";

export function GetComment(value: ObjectPredicate): { comment: string } | null {
  if (
    value.Predicate.type === "RdfSchema" &&
    value.Predicate.hash === "comment"
  ) {
    if (value.Object.type === "SchemaString") {
      return { comment: value.Object.value };
    }
    console.error(
      `Unexpected Comment predicate with non-string object: ${value}.`
    );
  }
  return null;
}

export type TParentClassName = SchemaObject | SchemaSource | W3CNameSpaced;
export function GetSubClassOf(
  value: ObjectPredicate
): { subClassOf: TParentClassName } | null {
  if (
    value.Predicate.type === "RdfSchema" &&
    value.Predicate.hash === "subClassOf"
  ) {
    if (
      value.Object.type === "RdfSchema" ||
      value.Object.type === "RdfSntax" ||
      value.Object.type === "SchemaString" ||
      value.Object.type === "Rdfs" ||
      value.Object.type === "WikidataConst"
    ) {
      console.error(
        `Unexpected object for predicate 'subClassOf': ${value.Object}.`
      );
      return null;
    }
    return { subClassOf: value.Object };
  }
  return null;
}

export function IsEnum(values: ObjectPredicate[]): boolean {
  for (const value of values) {
    const subClassOf = GetSubClassOf(value);
    if (
      subClassOf &&
      subClassOf.subClassOf.type === "SchemaObject" &&
      subClassOf.subClassOf.name === "Enumeration"
    ) {
      return true;
    }
  }
  return false;
}

export function IsDataType(t: TTypeName): boolean {
  switch (t.type) {
    case "SchemaObject":
      return t.name === "DataType";
    default:
      return false;
  }
}

export function IsDomainIncludes(value: TPredicate): boolean {
  return value.type === "SchemaObject" && value.name === "domainIncludes";
}
export function IsRangeIncludes(value: TPredicate): boolean {
  return value.type === "SchemaObject" && value.name === "rangeIncludes";
}

export type TTypeName = RdfSchema | RdfSyntax | SchemaObject;
export function GetType(value: ObjectPredicate): TTypeName | null {
  if (value.Predicate.type === "RdfSntax" && value.Predicate.hash === "type") {
    if (
      value.Object.type === "RdfSchema" ||
      value.Object.type === "RdfSntax" ||
      value.Object.type === "SchemaObject"
    ) {
      return value.Object;
    }
    throw new Error(`Unexpected type ${value.Object}`);
  }
  return null;
}

export function FindType(key: TSubject, values: ObjectPredicate[]): TTypeName {
  for (const value of values) {
    const type = GetType(value);
    if (type) return type;
  }

  throw new Error(
    `No type found for Subject ${key.toString()}. Triples include:\n${values
      .map(v => `${v.Predicate.toString()} ${v.Object.toString()}`)
      .join("\n")}`
  );
}

export function EnsureSubject(type: TTypeName): TSubject {
  if (type.type === "RdfSntax" || type.type === "RdfSchema")
    throw new Error(`Expected ${type.toString()} to be a Subject.`);
  return type;
}

export function IsClass(type: TTypeName): boolean {
  return type.type === "RdfSchema" && type.hash === "Class";
}
export function IsProperty(type: TTypeName): boolean {
  return type.type === "RdfSntax" && type.hash === "Property";
}
