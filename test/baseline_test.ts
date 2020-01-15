/**
 * Copyright 2020 Google LLC
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
 *
 * @fileoverview Baseline tests are a set of tests (in tests/baseline/) that
 * correspond to full comparisons of a generate .ts output based on a set of
 * Triples representing an entire ontology.
 */

import {existsSync, readdirSync, readFile, readFileSync} from 'fs';
import {parse} from 'path';
import {from, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {SetOptions} from '../src/logging';
import {WriteDeclarations} from '../src/transform/transform';
import {process, toTripleStrings} from '../src/triples/reader';
import {Triple} from '../src/triples/triple';
import {Context} from '../src/ts/context';

import {expectNoDiff} from './helpers/baseline';

function* getInputFiles(): IterableIterator<{
  input: string,
  spec: string,
  optLog: string,
  name: string,
}> {
  const files = readdirSync('test/baselines');
  for (const file of files) {
    const {ext, name, dir} = parse(file);
    if (ext === '.nt') {
      yield {
        input: `test/baselines${dir}/${file}`,
        spec: `test/baselines${dir}/${name}.ts.txt`,
        optLog: `test/baselines${dir}/${name}.log`,
        name
      };
    }
  }
}

function getTriples(file: string): Observable<Triple> {
  return new Observable<string>(subscriber => {
           readFile(file, {encoding: 'utf-8'}, (err, data) => {
             if (err) {
               subscriber.error(err);
             } else {
               subscriber.next(data);
               subscriber.complete();
             }
           });
         })
      .pipe(switchMap(contents => {
        const triples = toTripleStrings([contents]);
        return from(process(triples));
      }));
}

async function getActual(
    triples: Observable<Triple>, includeDeprecated: boolean) {
  const result: string[] = [];
  const context = new Context();
  context.setUrlContext('https://schema.org');
  await WriteDeclarations(triples, includeDeprecated, context, content => {
    result.push(content);
  });
  return result.join('');
}

describe('Baseline', () => {
  const realErr = console.error;
  const header =
      readFileSync(`test/baselines/common/header.ts.txt`).toString('utf-8');
  let logs: string[];

  beforeEach(() => {
    // Save log output.
    logs = [];
    console.error = (msg: string) => void logs.push(msg);
  });

  afterEach(() => {
    console.error = realErr;
  });

  for (const {input, spec, name, optLog} of getInputFiles()) {
    it(name, async () => {
      const shouldLog = existsSync(optLog);
      SetOptions({verbose: shouldLog});

      const triples = getTriples(input);
      const actual = await getActual(triples, ShouldIncludeDeprecated(name));
      const specValue = header + '\n' + readFileSync(spec).toString('utf-8');
      expectNoDiff(actual, specValue);

      if (shouldLog) {
        expectNoDiff(
            logs.join('\n') + '\n', readFileSync(optLog).toString('utf-8'));
      }
    });
  }
});

function ShouldIncludeDeprecated(name: string) {
  return !name.startsWith('nodeprecated_');
}