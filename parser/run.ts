import { closeSync, openSync, writeSync } from "fs";
import { groupBy, map, mergeMap, toArray, skip } from "rxjs/operators";
import { toScopedName, toClassName } from "./names";
import { load } from "./reader";
import { FindProperties, Grouped, ProcessClasses, EnumValue } from "./toClass";
import { Property, PropertyType } from "./toProperty";
import { ObjectPredicate } from "./triple";
import {
  FindType,
  IsDomainIncludes,
  TTypeName,
  IsClass,
  IsProperty,
  IsDataType,
  EnsureSubject
} from "./wellKnown";
import { SchemaObject, SchemaSource } from "./types";

async function main() {
  const result = load();
  const bySubject = await result
    .pipe(
      groupBy(value => value.Subject.toString()),
      mergeMap(group =>
        group.pipe(
          toArray(),
          map(array => ({
            Subject: array[0].Subject,
            values: array.map(item => ({
              Object: item.Object,
              Predicate: item.Predicate
            }))
          }))
        )
      ),
      toArray()
    )
    .toPromise();

  const byType = new Map<string, { type: TTypeName; decls: Grouped[] }>();
  for (const value of bySubject) {
    const type = FindType(value.Subject, value.values);
    let mine = byType.get(type.toString());
    if (!mine) {
      mine = { type, decls: [] };
      byType.set(type.toString(), mine);
    }
    mine.decls.push(value);
  }
  const groups = Array.from(byType.values());

  const classes = ProcessClasses(groups);
  const props = FindProperties(groups);

  for (const prop of props) {
    const rest: ObjectPredicate[] = [];
    const property = new PropertyType(prop.Subject);
    for (const value of prop.values) {
      const added = property.add(value);
      if (IsDomainIncludes(value.Predicate)) {
        const cls = classes.get(value.Object.toString());
        if (!cls) {
          console.error(
            "Could not find class for " + prop.Subject.toString(),
            value
          );
          continue;
        }
        cls.addProp(new Property(toScopedName(prop.Subject), property));
      } else if (!added) {
        rest.push(value);
      }
    }
    // Go over RangeIncludes or DomainIncludes:
    if (rest.length > 0) {
      //console.log("Still unadded: ", prop.Subject, rest);
    }
  }

  for (const group of groups) {
    // Already Processed
    if (IsClass(group.type) || IsProperty(group.type)) continue;

    // Skip DataType for now:
    if (IsDataType(group.type)) continue;

    // Everything Here should be an enum.
    for (const x of group.decls) {
      const enumValue = new EnumValue(x.Subject);
      const skipped: ObjectPredicate[] = [];
      for (const v of x.values) {
        if (!enumValue.add(v, classes)) skipped.push(v);
      }

      if (skipped.length > 0) {
        console.error(`Did not process: `, skipped);
      }
    }
  }

  const t = openSync("./out.ts", "w");
  for (const cls of classes.entries()) {
    writeSync(t, cls[1].toString());
  }
  closeSync(t);
}

main()
  .then(() => {
    console.log("Done");
    process.exit();
  })
  .catch(e => {
    console.log(e);
    process.abort();
  });
