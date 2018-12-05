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

import {SetOptions} from '../logging';
import {WriteDeclarations} from '../transform/transform';
import {load} from '../triples/reader';

import {ParseFlags} from './args';

async function main() {
  const options = ParseFlags();
  if (!options) return;
  SetOptions(options);

  const result = load(options.schema, options.layer);
  await WriteDeclarations(result, options.deprecated, write);
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
