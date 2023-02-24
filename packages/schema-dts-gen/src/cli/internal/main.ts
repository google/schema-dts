/**
 * Copyright 2023 Google LLC
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

import {Store} from 'n3';
import {Log, SetOptions} from '../../logging/index.js';
import {WriteDeclarations} from '../../transform/transform.js';
import {load, loadFile} from '../../triples/reader.js';
import {Context} from '../../ts/context.js';

import {ParseFlags} from '../args.js';

export async function main(write: (s: string) => void, args?: string[]) {
  const options = ParseFlags(args);
  SetOptions(options);

  const ontologyUrl = options.ontology;
  const filePath = options.file;
  let result: Store;

  if (filePath) {
    Log(`Loading Ontology from path: ${filePath}`);
    result = await loadFile(filePath);
  } else {
    Log(`Loading Ontology from URL: ${ontologyUrl}`);
    result = await load(ontologyUrl);
  }
  const context = Context.Parse(options.context);
  await WriteDeclarations(result, options.deprecated, context, write);
}
