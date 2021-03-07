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
 */

import {Readable} from 'stream';
import fs from 'fs';
import {main} from '../../src/cli/internal/main';
import * as Logging from '../../src/logging';
import * as Transform from '../../src/transform/transform';

describe('main Args logs', () => {
  let readStreamCreatorFn: jest.SpyInstance;
  beforeEach(() => {
    const mockFileLine = `<http://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .\n`;
    const mockedStream = Readable.from([mockFileLine]);
    readStreamCreatorFn = jest
      .spyOn(fs, 'createReadStream')
      //@ts-ignore
      .mockImplementation(path => mockedStream);
  });
  it(`the path it is loading from`, async () => {
    const logs = [''];
    // log messages get caught for checking assert:
    jest
      .spyOn(Logging, 'Log')
      .mockImplementation((msg: string) => void logs.push(msg));
    // but doesn't write the output .ts-file:
    jest
      .spyOn(Transform, 'WriteDeclarations')
      .mockImplementation(async (...args) => {});
    await main(['--file', `ontology-file.nt`, `--verbose`]);
    expect(logs.join('')).toMatchInlineSnapshot(
      `"Loading Ontology from path: ontology-file.nt"`
    );
  });
});
