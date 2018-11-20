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
import {closeSync, openSync, writeSync} from 'fs';
import {groupBy, map, mergeMap, skip, toArray} from 'rxjs/operators';

import {toClassName, toScopedName} from './names';
import {load} from './reader';
import {EnumValue, FindProperties, Grouped, ProcessClasses} from './toClass';
import {Property, PropertyType} from './toProperty';
import {ObjectPredicate} from './triple';
import {SchemaObject, SchemaSource} from './types';
import {EnsureSubject, FindType, IsClass, IsDataType, IsDomainIncludes, IsProperty, TTypeName} from './wellKnown';

async function main() {
  const result = load();
  const bySubject =
      await result
          .pipe(
              groupBy(value => value.Subject.toString()),
              mergeMap(
                  group => group.pipe(
                      toArray(),
                      map(array => ({
                            Subject: array[0].Subject,
                            values: array.map(item => ({
                                                Object: item.Object,
                                                Predicate: item.Predicate
                                              }))
                          })))),
              toArray())
          .toPromise();

  const byType = new Map < string, {
    type: TTypeName;
    decls: Grouped[]
  }
  > ();
  for (const value of bySubject) {
    const type = FindType(value.Subject, value.values);
    let mine = byType.get(type.toString());
    if (!mine) {
      mine = {type, decls: []};
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
              'Could not find class for ' + prop.Subject.toString(), value);
          continue;
        }
        cls.addProp(new Property(toScopedName(prop.Subject), property));
      } else if (!added) {
        rest.push(value);
      }
    }
    // Go over RangeIncludes or DomainIncludes:
    if (rest.length > 0) {
      // console.log("Still unadded: ", prop.Subject, rest);
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

  const t = openSync('./out.ts', 'w');
  for (const cls of classes.entries()) {
    writeSync(t, cls[1].toString());
  }
  closeSync(t);
}

main()
    .then(() => {
      console.log('Done');
      process.exit();
    })
    .catch(e => {
      console.log(e);
      process.abort();
    });
