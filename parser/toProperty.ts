import { TPredicate, TObject, TSubject } from "./triple";
import { GetComment, GetType, IsRangeIncludes } from "./wellKnown";
import { toTypeName } from "./names";

export class PropertyType {
  public readonly comments: string[] = [];
  public readonly types: TObject[] = [];
  constructor(public readonly subect: TSubject, object?: TObject) {
    if (object) this.types.push(object);
  }

  add(value: { Predicate: TPredicate; Object: TObject }): boolean {
    const c = GetComment(value);
    if (c) {
      this.comments.push(c.comment);
      return true;
    }
    if (GetType(value)) return true; // We used types already.

    if (IsRangeIncludes(value.Predicate)) {
      this.types.push(value.Object);
      return true;
    }

    return false;
  }
}

export class Property {
  constructor(
    private readonly key: string,
    private readonly type: PropertyType
  ) {}

  required() {
    return this.key.startsWith("@");
  }

  toString() {
    return (
      this.type.comments.map(c => "  /// " + c).join("\n") +
      `
  "${this.key}"${this.required() ? "" : "?"}: ${this.type.types
        .map(type => toTypeName(type))
        .join(" | ")};
`
    );
  }
}
