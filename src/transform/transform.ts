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
 */
import {Observable} from 'rxjs';
import {
  createPrinter,
  createSourceFile,
  EmitHint,
  NewLineKind,
  ScriptKind,
  ScriptTarget,
} from 'typescript';

import {asTopicArray} from '../triples/operators';
import {Triple} from '../triples/triple';
import {Sort} from '../ts/class';
import {Context} from '../ts/context';

import {ProcessClasses} from './toClass';
import {ProcessEnums} from './toEnum';
import {ProcessProperties} from './toProperty';

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
  triples: Observable<Triple>,
  includeDeprecated: boolean,
  context: Context,
  write: (content: string) => Promise<void> | void
) {
  const topics = await triples.pipe(asTopicArray()).toPromise();

  const classes = ProcessClasses(topics);
  ProcessProperties(topics, classes);
  ProcessEnums(topics, classes);
  const sorted = Array.from(classes.values()).sort(Sort);

  await write('// tslint:disable\n\n');
  const source = createSourceFile(
    'result.ts',
    '',
    ScriptTarget.ES2015,
    /*setParentNodes=*/ false,
    ScriptKind.TS
  );
  const printer = createPrinter({newLine: NewLineKind.LineFeed});

  write(printer.printNode(EmitHint.Unspecified, context.toNode(), source));
  write('\n\n');

  for (const cls of sorted) {
    if (cls.deprecated && !includeDeprecated) continue;

    for (const node of cls.toNode(context, !includeDeprecated)) {
      const result = printer.printNode(EmitHint.Unspecified, node, source);
      await write(result);
      await write('\n');
    }
    await write('\n');
  }
}
