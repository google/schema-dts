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

import {Log, SetOptions} from '../logging';
import {WriteDeclarations} from '../transform/transform';
import {load} from '../triples/reader';
import {Context} from '../ts/context';

import {IsCustom, ParseFlags} from './args';

function parseContext(flag: string) {
  const keyVals = flag.split(',');
  const context = new Context();
  if (keyVals.length === 1) {
    context.setUrlContext(flag);
  } else {
    for (const keyVal of keyVals) {
      const match = /^([^:]+):(.+)$/g.exec(keyVal);
      if (!match || match[1] === undefined || match[2] === undefined) {
        throw new Error(`Unknown value ${keyVal} in --context flag.`);
      }
      context.addNamedContext(match[1], match[2]);
    }
  }
  context.validate();
  return context;
}

async function main() {
  const options = ParseFlags();
  if (!options) return;
  SetOptions(options);

  const ontologyUrl = IsCustom(options) ?
      options.ontology :
      `https://schema.org/version/${options.schema}/${options.layer}.nt`;
  Log(`Loading Ontology from URL: ${ontologyUrl}`);

  const result = load(ontologyUrl);
  const context = parseContext(options.context);
  await WriteDeclarations(result, options.deprecated, context, write);
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
