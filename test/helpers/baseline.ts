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
import {AssertionError} from 'assert';
import {diffLines} from 'diff';

function withoutCrLf(input: string): string {
  return input.replace(/\r\n/g, '\n');
}

export function expectNoDiff(actual: string, expected: string): void {
  const diff = diffLines(withoutCrLf(actual), withoutCrLf(expected));
  const results = diff.filter(line => line.added || line.removed);

  if (results.length === 0) return;

  const lines: string[] = [];
  for (const result of results) {
    const prefix = result.added ? '+' : result.removed ? '-' : ' ';
    const prepended =
        result.value.split('\n').map(value => `${prefix}${value}`);
    lines.push(...prepended);
  }
  const reason = lines.join('\n');
  throw new AssertionError({message: `Mismatch detected:\n${reason}`});
}
