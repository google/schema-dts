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
import {ArgumentParser} from 'argparse';
import {OperatorFunction} from 'rxjs';
import {groupBy, map, mergeMap, toArray} from 'rxjs/operators';
import {createPrinter, createSourceFile, EmitHint, NewLineKind, ScriptKind, ScriptTarget} from 'typescript';

import {toScopedName} from '../lib/names';
import {EnumValue, FindProperties, ProcessClasses} from '../lib/toClass';
import {Property, PropertyType} from '../lib/toProperty';
import {ObjectPredicate, Topic, toString, Triple, TypedTopic} from '../lib/triple';
import {GetTypes, HasEnumType, IsDomainIncludes} from '../lib/wellKnown';

import {load} from './reader';

interface Options {
  verbose: boolean;
  schema: string;
  layer: string;
}
function ParseFlags(): Options|undefined {
  const parser = new ArgumentParser(
      {version: '0.0.1', addHelp: true, description: 'schema-dts generator'});
  parser.addArgument('--verbose', {defaultValue: false});
  parser.addArgument(
      '--schema',
      {defaultValue: '3.4', help: 'The version of the schema to load.'});
  parser.addArgument('--layer', {
    defaultValue: 'schema',
    help: 'Which layer of the schema to load? E.g. schema or all-layers.'
  });
  return parser.parseArgs();
}

function groupBySubject(): OperatorFunction<Triple, Topic> {
  return (observable) => observable.pipe(
             groupBy(triple => triple.Subject.toString()),
             mergeMap(
                 group => group.pipe(
                     toArray(),
                     map(array => ({
                           Subject: array[0].Subject,  // All are the same
                           values: array.map(
                               ({Object, Predicate}) => ({Predicate, Object}))
                         })),

                     )),
         );
}

function asTopic(): OperatorFunction<Topic, TypedTopic> {
  return (observable) => observable.pipe(
             map(bySubject => ({
                   ...bySubject,
                   types: GetTypes(bySubject.Subject, bySubject.values)
                 })));
}

async function main() {
  const options = ParseFlags();
  if (!options) return;

  const result = load(options.schema, options.layer);
  const topics = await result
                     .pipe(
                         groupBySubject(),
                         asTopic(),
                         toArray(),
                         )
                     .toPromise();

  const classes = ProcessClasses(topics);
  const props = FindProperties(topics);

  for (const prop of props) {
    const rest: ObjectPredicate[] = [];
    const property = new PropertyType(prop.Subject);
    for (const value of prop.values) {
      const added = property.add(value);
      if (IsDomainIncludes(value.Predicate)) {
        const cls = classes.get(value.Object.toString());
        if (!cls) {
          throw new Error(`Could not find class for ${
              prop.Subject.toString()}, ${toString(value)}.`);
        }
        cls.addProp(new Property(toScopedName(prop.Subject), property));
      } else if (!added) {
        rest.push(value);
      }
    }
    // Go over RangeIncludes or DomainIncludes:
    if (rest.length > 0 && options.verbose) {
      console.error(`Still unadded: ${prop.Subject.toString()}:`);
      for (const unadded of rest) {
        console.error(`  ${toString(unadded)}`);
      }
    }
  }

  // Process Enums
  for (const topic of topics) {
    if (!HasEnumType(topic.types)) continue;

    // Everything Here should be an enum.
    const enumValue = new EnumValue(topic.Subject);
    const skipped: ObjectPredicate[] = [];
    for (const v of topic.values) {
      if (!enumValue.add(v, classes)) skipped.push(v);
    }

    if (skipped.length > 0 && options.verbose) {
      console.error(`Did not process: `, skipped.map(toString));
    }
  }

  write('// tslint:disable\n\n');
  const source = createSourceFile(
      'result.ts', '', ScriptTarget.ES2015, /*setParentNodes=*/false,
      ScriptKind.TS);
  const printer = createPrinter({newLine: NewLineKind.LineFeed});

  for (const cls of classes.entries()) {
    for (const node of cls[1].toNode()) {
      const result = printer.printNode(EmitHint.Unspecified, node, source);
      write(result);
      write('\n');
    }
    write('\n');
  }
}

function write(content: string) {
  process.stdout.write(content, 'utf-8');
}

main()
    .then(() => {
      process.exit();
    })
    .catch(e => {
      console.error(e);
      process.abort();
    });
