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
 *
 * @fileoverview A simple runner around a mocked version of the CLI's main()
 * function, for testing.
 */

import {ClientRequest, IncomingMessage} from 'http';
import https from 'https';

import {main} from '../../src/cli/internal/main.js';
import {SetLogger, SetOptions} from '../../src/logging/index.js';
import {assert} from '../../src/util/assert.js';

import {flush} from './async.js';

export async function inlineCli(
  content: string,
  args: string[],
): Promise<{actual: string; actualLogs: string}> {
  // Restorables
  const realGet = https.get;
  let ResetLogger: undefined | (() => void) = undefined;

  try {
    // Controllers
    let innerOnData: (chunk: Buffer) => void;
    let innerOnEnd: () => void;

    const write = (s: string) => writes.push(s);

    ResetLogger = SetLogger((msg: string) => void logs.push(msg));

    // TODO(eyas): A lot of the mocking here is due to the fact that https.get
    // cannot read local file:/// paths. If it were possible, the get mocking
    // would go away, making a lot of this much simpler.
    https.get = ((
      _: string,
      callback: (inc: IncomingMessage) => void,
    ): ClientRequest => {
      callback({
        statusCode: 200,
        statusMessage: 'Ok',
        on: (event: string, listener: (arg?: unknown) => void) => {
          if (event === 'data') innerOnData = listener;
          if (event === 'end') innerOnEnd = listener;
        },
      } as IncomingMessage);
      return {on: () => {}} as unknown as ClientRequest;
    }) as typeof https.get;

    // Outputs
    const writes: string[] = [];
    const logs: string[] = [];

    const wholeProgram = main(write, args);
    await flush();

    assert(innerOnData!);
    assert(innerOnEnd!);

    innerOnData(Buffer.from(content));
    innerOnEnd();

    await wholeProgram;

    return {
      actual: writes.join(''),
      actualLogs: logs.join('\n') + '\n',
    };
  } finally {
    https.get = realGet;

    // Always reset verbosity settings.
    SetOptions({verbose: false});
    ResetLogger && ResetLogger();
  }
}
