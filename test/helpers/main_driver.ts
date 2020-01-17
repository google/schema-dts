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
 * @fileoverview A simple runner around a mocked version of the CLI's main()
 * function, for testing.
 */

import {fail} from 'assert';
import {readFile} from 'fs';
import {ClientRequest, IncomingMessage} from 'http';
import https from 'https';

import {main} from '../../src/cli/internal/main';

import {flush} from './async';

export async function cliOnFile(
    file: string,
    options:
        {includeDeprecated: boolean, shouldLog: boolean, contextFlag?: string}):
    Promise<{actual: string, actualLogs: string}> {
  // Restorables
  const realWrite = process.stdout.write;
  const realErr = console.error;
  const realGet = https.get;

  // Controllers
  let innerOnData: (chunk: Buffer) => void;
  let innerOnEnd: () => void;

  // Mockables
  process.stdout.write =
      ((...params: Parameters<typeof process.stdout.write>): boolean => {
        const str = params[0];
        if (typeof str === 'string') {
          writes.push(str);
          return true;
        } else {
          return realWrite(...params);
        }
      }) as typeof process.stdout.write;
  console.error = (msg: string) => void logs.push(msg);

  // TODO(eyas): A lot of the mocking here is due to the fact that https.get
  // cannot read local file:/// paths. If it were possible, the get mocking
  // would go away, making a lot of this much simpler.
  https.get =
      ((_: string, callback: (inc: IncomingMessage) => void): ClientRequest => {
        callback({
          statusCode: 200,
          statusMessage: 'Ok',
          on: (event: string, listener: (arg?: unknown) => void) => {
            if (event === 'data') innerOnData = listener;
            if (event === 'end') innerOnEnd = listener;
          }
        } as IncomingMessage);
        return {on: () => {}} as {} as ClientRequest;
      }) as typeof https.get;

  // Outputs
  const writes: string[] = [];
  const logs: string[] = [];

  try {
    const args = ['--ontology', `https://fake.com/${file}`];
    if (!options.includeDeprecated) args.push('--nodeprecated');
    if (options.shouldLog) args.push('--verbose');
    if (options.contextFlag) args.push('--context', options.contextFlag);

    const wholeProgram = main(args);
    await flush();

    readFile(file, (err, data) => {
      if (err) {
        fail(err);
      } else {
        innerOnData(data);
        innerOnEnd();
      }
    });

    await wholeProgram;

    return {
      actual: writes.join(''),
      actualLogs: logs.join('\n') + '\n',
    };

  } finally {
    process.stdout.write = realWrite;
    console.error = realErr;
    https.get = realGet;
  }
}