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

import {existsSync, readdirSync, readFileSync} from 'fs';
import {parse} from 'path';

import {expectNoDiff} from './helpers/baseline';
import {cliOnFile} from './helpers/main_driver';

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

describe('Baseline', () => {
  const header =
      readFileSync(`test/baselines/common/header.ts.txt`).toString('utf-8');

  for (const {input, spec, name, optLog} of getInputFiles()) {
    it(name, async () => {
      const shouldLog = existsSync(optLog);

      const args = ['--ontology', `https://fake.com/${input}`];
      if (!ShouldIncludeDeprecated(name)) args.push('--nodeprecated');
      if (shouldLog) args.push('--verbose');

      const {actual, actualLogs} = await cliOnFile(input, args);
      const specValue = header + '\n' + readFileSync(spec).toString('utf-8');
      expectNoDiff(actual, specValue);

      if (shouldLog) {
        expectNoDiff(actualLogs, readFileSync(optLog).toString('utf-8'));
      }
    });
  }

  describe('manual', () => {
    it('default ontology', async () => {
      const {actual, actualLogs} = await cliOnFile(
          'test/baselines/manual/default_ontology.nt', ['--verbose']);

      const expected = header + '\n' +
          readFileSync(`test/baselines/manual/default_ontology.ts.txt`)
              .toString('utf-8');
      const expectedLogs =
          readFileSync(`test/baselines/manual/default_ontology.log`)
              .toString('utf-8');

      expectNoDiff(actual, expected);
      expectNoDiff(actualLogs, expectedLogs);
    });
  });
});

function ShouldIncludeDeprecated(name: string) {
  return !name.startsWith('nodeprecated_');
}