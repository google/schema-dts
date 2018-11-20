/**
 * Copyright 2018 Google LLC
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
import { toClassName, toScopedName, toEnumName } from "./names";
import { Property, PropertyType } from "./toProperty";
import { ObjectPredicate, TObject, TPredicate, TSubject } from "./triple";
import { SchemaObject, SchemaString } from "./types";
import {
  GetComment,
  GetSubClassOf,
  GetType,
  IsClass,
  IsProperty,
  TTypeName
} from "./wellKnown";

export type ClassMap = Map<string, Class>;

export interface Grouped {
  Subject: TSubject;
  values: Array<ObjectPredicate>;
}

export class Class {
  private readonly comments: string[] = [];
  private readonly parents: string[] = [];
  private readonly _props: Property[] = [];
  private readonly _enums: EnumValue[] = [];
  private isLeaf = true;

  properties() {
    return this.isLeaf
      ? [
          new Property(
            "@type",
            new PropertyType(
              this.subject,
              new SchemaString(toScopedName(this.subject))
            )
          ),
          ...this._props
        ]
      : this._props;
  }

  constructor(public readonly subject: TSubject) {}
  add(
    value: { Predicate: TPredicate; Object: TObject },
    classMap: ClassMap
  ): boolean {
    const c = GetComment(value);
    if (c) {
      this.comments.push(c.comment);
      return true;
    }
    const s = GetSubClassOf(value);
    if (s) {
      this.parents.push(toClassName(s.subClassOf));
      const parentClass = classMap.get(s.subClassOf.toString());
      if (parentClass) {
        parentClass.isLeaf = false;
      } else {
        throw new Error(
          `Couldn't find parent of ${this.subject.toString()}, ${s.subClassOf.toString()}`
        );
      }
      return true;
    }

    if (GetType(value)) return true; // We used types already.

    return false;
  }
  addProp(p: Property) {
    this._props.push(p);
  }
  addEnum(e: EnumValue) {
    this._enums.push(e);
  }

  toString(): string {
    const sb = new StringBuilder();

    this.enumPart(sb);
    buildCommentString(sb, this.comments);
    this.classPart(sb);
    sb.push("\n\n");
    return sb.join("");
  }

  private joinParen(arr: string[], joiner: string): string {
    if (arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    return `(${arr.join(joiner)})`;
  }

  private classPart(sb: StringBuilder): void {
    const props = this.properties();
    const isEnum = this._enums.length > 0;
    sb.push(
      "export type ",
      toClassName(this.subject),
      " = ",
      isEnum ? `${toClassName(this.subject)}Enum | (` : "",
      this.joinParen(this.parents, "|")
    );
    if (props.length > 0) {
      sb.push(" & {\n", ...props.map(p => p.toString()), "}");
    }
    if (isEnum) sb.push(")");
    sb.push(";\n");
  }

  private enumPart(sb: StringBuilder): void {
    if (this._enums.length === 0) return;
    const className = toClassName(this.subject);
    sb.push(
      `export enum ${className}Enum {\n`,
      this._enums.map(e => e.toString()).join(",\n"),
      "\n}\n"
    );
  }
}

export class Builtin extends Class {
  constructor(
    private readonly name: string,
    private readonly equivTo: string,
    private readonly doc?: string
  ) {
    super(new SchemaObject(name));
  }
  toString() {
    return `${this.doc ? `/** ${this.doc} */` : ""}
export type ${this.name} = ${this.equivTo};
`;
  }

  validateType() {}
}

export class EnumValue {
  readonly Instance = "EnumValue";

  private readonly comments: string[] = [];
  constructor(private readonly value: TSubject) {}

  add(value: ObjectPredicate, map: ClassMap) {
    // First, "Type" containment.
    const type = GetType(value);
    if (type) {
      const enumObject = map.get(type.toString());
      if (!enumObject)
        throw new Error(`Couldn't find ${type.toString()} in classes.`);
      enumObject.addEnum(this);
      return true;
    }

    // Comment.
    const comment = GetComment(value);
    if (comment) {
      this.comments.push(comment.comment);
      return true;
    }

    return false;
  }

  toString() {
    const sb = new StringBuilder();
    buildCommentString(sb, this.comments);
    sb.push(`${toEnumName(this.value)} = "${this.value.toString()}"`);
    return sb.join("");
  }
}

class StringBuilder extends Array<string> {}

function buildCommentString(sb: StringBuilder, comments: string[]) {
  if (comments) {
    sb.push("/**\n", ...comments.map(comment => ` * ${comment}\n`), "*/\n");
  }
}

export function toClass(cls: Class, group: Grouped, map: ClassMap): Class {
  const rest: Array<ObjectPredicate> = [];
  for (const value of group.values) {
    const added = cls.add(value, map);
    if (!added) rest.push(value);
  }
  return cls;
}

const wellKnownTypes = [
  new Builtin("Text", "string"),
  new Builtin("Number", "number"),
  new Builtin(
    "Time",
    "string",
    "DateTime represented in string, e.g. 2017-01-04T17:10:00-05:00."
  ),
  new Builtin("Boolean", "boolean")
];

export function ProcessIfClass(input: {
  type: TTypeName;
  decls: Grouped[];
}): ClassMap | null {
  if (IsClass(input.type)) {
    const ret = new Map<string, Class>();
    for (const wk of wellKnownTypes) {
      ret.set(wk.subject.toString(), wk);
    }

    // Forward Declare once
    for (const clsD of input.decls) {
      const cls = new Class(clsD.Subject);
      ret.set(clsD.Subject.toString(), cls);
    }
    // Then build
    for (const clsD of input.decls) {
      const cls = ret.get(clsD.Subject.toString())!;
      toClass(cls, clsD, ret);
    }
    return ret;
  }

  if (IsProperty(input.type)) {
    return null;
  }
  return null;
}
export function ProcessClasses(
  input: Array<{ type: TTypeName; decls: Grouped[] }>
): ClassMap {
  for (const elem of input) {
    const result = ProcessIfClass(elem);
    if (result) {
      return result;
    }
  }
  throw new Error("Unexpected: Expected a class");
}

export function FindProperties(
  input: Array<{ type: TTypeName; decls: Grouped[] }>
): Grouped[] {
  for (const elem of input) {
    if (IsProperty(elem.type)) return elem.decls;
  }
  throw new Error("Unexpected: Expected a property");
}
