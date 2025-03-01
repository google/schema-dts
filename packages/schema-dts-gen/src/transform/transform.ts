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
import ts from 'typescript';
const {
  createPrinter,
  createSourceFile,
  EmitHint,
  NewLineKind,
  ScriptKind,
  ScriptTarget,
} = ts;

import {asTopicArray} from '../triples/operators.js';
import {Sort} from '../ts/class.js';
import {Context} from '../ts/context.js';

import {ProcessClasses} from './toClass.js';
import {ProcessEnums} from './toEnum.js';
import {ProcessProperties} from './toProperty.js';
import {HelperTypes} from '../ts/helper_types.js';

import {Store} from 'n3';

/**
 * Writes TypeScript declarations for all Classes, Typedefs, and Enums
 * representing the ontology passed in the 'triples' parameter.
 *
 * @param triples Observable emitting all Triples found in an ontology.
 * @param includeDeprecated True if classes and properties marked with
 *     'supersededBy' should still be included (as 'deprecated') in the final
 *     TypeScript output.
 * @param write Callback function to write a portion of the file. Will be called
 *     sequentially on separate chunks within a file.
 *
 * @returns Promise indicating completion.
 */
export async function WriteDeclarations(
  graph: Store,
  includeDeprecated: boolean,
  context: Context,
  write: (content: string) => Promise<void> | void,
) {
  const topics = asTopicArray(graph);

  const classes = ProcessClasses(topics);
  ProcessProperties(topics, classes);
  ProcessEnums(topics, classes);
  const sorted = Array.from(classes.values()).sort(Sort);

  const properties = {
    hasRole: !!(
      classes.get('http://schema.org/Role') ||
      classes.get('https://schema.org/Role')
    ),
    skipDeprecatedProperties: !includeDeprecated,
  };

  const source = createSourceFile(
    'result.ts',
    '',
    ScriptTarget.ES2015,
    /*setParentNodes=*/ false,
    ScriptKind.TS,
  );
  const printer = createPrinter({newLine: NewLineKind.LineFeed});

  for (const helperType of HelperTypes(context, properties)) {
    await write(printer.printNode(EmitHint.Unspecified, helperType, source));
    await write('\n');
  }
  await write('\n');

  for (const cls of sorted) {
    if (cls.deprecated && !includeDeprecated) continue;

    for (const node of cls.toNode(context, properties)) {
      const result = printer.printNode(EmitHint.Unspecified, node, source);
      await write(result);
      await write('\n');
    }
    await write('\n');
  }
}
