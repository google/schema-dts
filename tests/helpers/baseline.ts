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
// tslint:disable-next-line no-reference
/// <reference path="./baseline.d.ts" />

import 'jasmine';
import {diffLines} from 'diff';

function handleDiff(
    actual: string, expected: string): jasmine.CustomMatcherResult {
  const diff = diffLines(actual, expected);
  const results = diff.filter(line => line.added || line.removed);

  if (results.length === 0) return {pass: true};

  const lines: string[] = [];
  for (const result of results) {
    const prefix = result.added ? '+' : result.removed ? '-' : ' ';
    const prepended =
        result.value.split('\n').map(value => `${prefix}${value}`);
    lines.push(...prepended);
  }
  const reason = lines.join('\n');
  return {pass: false, message: `Mismatch detected:\n${reason}`};
}

export function addMatchers() {
  jasmine.addMatchers({
    'toDiffCleanlyWith': (util, testers) => {
      return {
        compare: handleDiff,
        negativeCompare: () => {
          throw new Error('Not implemented');
        }
      };
    }
  });
}
