import { TSubject, TObject } from "./triple";

export function toClassName(subject: TSubject): string {
  switch (subject.type) {
    case "SchemaObject":
      return subject.name;
    case "SchemaSource":
      return "S_" + subject.hash;
    case "W3CNameSpaced":
      return subject.ns + "_" + subject.hash;
    default:
      const shouldBeNever: never = subject;
      return shouldBeNever;
  }
}

export function toTypeName(object: TObject): string {
  switch (object.type) {
    case "SchemaObject":
    case "SchemaSource":
    case "W3CNameSpaced":
      return toClassName(object);
    case "SchemaString":
      return object.toString();
    case "RdfSchema":
    case "RdfSntax":
    case "Rdfs":
    case "WikidataConst":
      throw new Error("Not sure yet about " + JSON.stringify(object));
  }
}

export function toScopedName(subject: TSubject): string {
  switch (subject.type) {
    case "SchemaObject":
      return subject.name;
    case "SchemaSource":
      return subject.hash;
    case "W3CNameSpaced":
      return subject.hash;
    default:
      const shouldBeNever: never = subject;
      return shouldBeNever;
  }
}

export function toEnumName(subject: TSubject): string {
  return toScopedName(subject).replace(/[^A-Za-z0-9_]/g, "_");
}
