/**
 * Copyright 2021 Google LLC
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
 */
import {jest} from '@jest/globals';

import fs from 'fs/promises';
import {main} from '../../src/cli/internal/main.js';
import {SetLogger} from '../../src/logging/index.js';

describe('main Args logs', () => {
  let logs: string[];
  let ResetLogger: undefined | (() => void) = undefined;

  beforeEach(() => {
    const mockFileLine = `<http://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .\n`;
    jest
      .spyOn(fs, 'readFile')
      .mockImplementation(_ => Promise.resolve(mockFileLine));

    logs = [];
    ResetLogger = SetLogger(msg => logs.push(msg));
  });
  afterEach(() => {
    ResetLogger && ResetLogger();
  });

  it(`the path it is loading from`, async () => {
    await main(noop, ['--file', `ontology-file.nt`, `--verbose`]);
    expect(logs.join('')).toMatchInlineSnapshot(
      `"Loading Ontology from path: ontology-file.nt"`
    );
  });
});

function noop() {}
