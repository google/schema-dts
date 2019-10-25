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
 *
 * @fileoverview Baseline tests are a set of tests (in tests/baseline/) that
 * correspond to full comparisons of a generate .ts output based on a set of
 * Triples representing an entire ontology.
 */

import 'jasmine';

import {readdirSync, readFile, readFileSync} from 'fs';
import {parse} from 'path';
import {from, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {WriteDeclarations} from '../src/transform/transform';
import {process, toTripleStrings} from '../src/triples/reader';
import {Triple} from '../src/triples/triple';
import {Context} from '../src/ts/context';

import {addMatchers} from './helpers/baseline';

function* getInputFiles(): IterableIterator<{
  input: string,
  spec: string,
  name: string,
}> {
  const files = readdirSync('tests/baselines');
  for (const file of files) {
    const {ext, name, dir} = parse(file);
    if (ext === '.nt') {
      yield {
        input: `tests/baselines${dir}/${file}`,
        spec: `tests/baselines${dir}/${name}.ts.txt`,
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

async function getResult(triples: Observable<Triple>) {
  const result: string[] = [];
  const context = new Context();
  context.setUrlContext('https://schema.org');
  await WriteDeclarations(
      triples, /*includeDeprecated=*/true, context, content => {
        result.push(content);
      });
  return result.join('');
}

describe('Baseline', () => {
  beforeEach(() => {
    addMatchers();
  });
  const header =
      readFileSync(`tests/baselines/common/header.ts.txt`).toString('utf-8');

  for (const {input, spec, name} of getInputFiles()) {
    it(name, async () => {
      const triples = getTriples(input);
      const result = await getResult(triples);
      const specValue = header + '\n' + readFileSync(spec).toString('utf-8');
      expect(result).toDiffCleanlyWith(specValue);
    });
  }
});
